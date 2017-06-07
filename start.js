var APP_NAME = "authorization";
var idpAuth    = require('idpauth')
var express    = require('express')
var bodyParser = require('body-parser')
var uuid = require('uuid');
var url = require('url');
var app = express()
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');
var cookieSession = require('cookie-session')
app.set('trust proxy', 1)
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

var mongo = require("./MongoDBHandler.js");
var mongoDBHandler = new mongo();

var NodeRSA = require('node-rsa');
var privateKey = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n'+
                      'MIIBOwIBAAJBAMCgMCiHtdEurBp604bVgkoR8wgctNKrqVNlQQaIGBZqSffMgTC1\n'+
                      'bH5rfE2V4Io+d74Jc7h+RzKDf5vlo4KH/icCAwEAAQJAAKrNX+aQb6gMuo7AWtA0\n'+
                      'glMrl1SaH7yuenZ4UjB4fONhz5Tki2dcYKmvQduL4RvA8yMFgxO9gjrpBfUq9p/S\n'+
                      '2QIhAPo4PdSwuLRLfQxynOkHRKmKyXL0qbMjRYv8eRo+BF6LAiEAxRNYZj6vJrEr\n'+
                      'bP0Gy+skmDEG4jRSOd9nZIwJYgfbDlUCIAsztWDuQHah4olKIEg2cRZ+BiLFXUuN\n'+
                      'yrFHrkxEdoGdAiEArpLSbc/9S6MJusPw71Ze1kontN1wMT/K0PCTpzkaPPkCIQDC\n'+
                      '8eO5uyf/nzlgyw9gxtZ2Dk3EgN+tCpC7gEpQN6L5iQ==\n'+
                      '-----END RSA PRIVATE KEY-----');
var publicKeyString = '-----BEGIN PUBLIC KEY-----\n'+
					'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMCgMCiHtdEurBp604bVgkoR8wgctNKr\n'+
					'qVNlQQaIGBZqSffMgTC1bH5rfE2V4Io+d74Jc7h+RzKDf5vlo4KH/icCAwEAAQ==\n'+
					'-----END PUBLIC KEY-----';
var sha1 = require('sha1');

//----------------------------------------------------------------------------------
	/**
	*@desc: function to send HTTP response
	*@param: Object, contain {httpCode, contentType, content, response, err, result}
	*/
	sendHTTPResponse = function(param){
		param.oResponse.writeHead(param.httpCode, {
        	'Content-Type' : param.contentType
        });
        var content = param.content;
        if(typeof content === 'object'){
        	content = JSON.stringify(param.content);
        }
        param.oResponse.end(content);
	}

port = 3004;
host = '127.0.0.1';
var server = app.listen(port, function(){
    console.log('Listening at http://' + host + ':' + port);    
});

sendUnAuth = function(res){
		sendHTTPResponse({
    		httpCode : 401,
    		contentType : 'application/text',
    		content : 'Unauthorize access',
    		oResponse : res
    	});
}

sendPublicKey = function(res){
		sendHTTPResponse({
    		httpCode : 200,
    		contentType : 'application/text',
    		content : publicKeyString,
    		oResponse : res
    	});
}
//------------------------------------------------------------------------------------
app.get('/oauth/getPublicKey',function(req,res){
    sendPublicKey(res);
});

// app.get('/oauth/getToken',function(req,res){
//     auth = req.headers.authorization;
//     var token = auth.split(" ");
//     if(token[0]!="Basic"){
//     	sendUnAuth(res);
//     	return;
//     }
//     var plain = new Buffer.from(token[1],'base64').toString();
//     var user = plain.split(":")[0];
//     var pwd = plain.split(":")[1];
//     var pwdSalt = sha1(pwd);
//     console.log("Login Request from user:" + user);
//     mongoDBHandler.read("authorization",{
// 	    	userid:user,
// 	    	pwd:pwdSalt
// 	    },function(err,result){
// 	    	if(err){sendUnAuth(res);return;}
// 	    	if(result.length<=0){sendUnAuth(res);return;}
// 	    	var token = {};
// 	    	token.auth = {};
// 	    	token.auth.app = result[0].apps;
// 	    	token.auth.user = result[0].userid;
// 	    	token.sign = privateKey.sign(token.auth).toString('base64');
// 	    	sendHTTPResponse({
// 	    		httpCode : 200,
// 	    		contentType : 'application/json',
// 	    		content : token,
// 	    		oResponse : res
// 	    	});
// 	    }
//     );
// });

app.get('/oauth/authenticate',function(req,res){
    auth = req.headers.authorization;
    var token = auth.split(" ");
    if(token[0]!="Basic"){
    	sendUnAuth(res);
    	return;
    }
    var plain = new Buffer.from(token[1],'base64').toString();
    var user = plain.split(":")[0];
    var pwd = plain.split(":")[1];
    var pwdSalt = sha1(pwd);
    console.log("Login Request from user:" + user);
    mongoDBHandler.read("authorization",{
	    	userid:user,
	    	pwd:pwdSalt
	    },function(err,result){
	    	if(err){sendUnAuth(res);return;}
	    	if(result.length<=0){sendUnAuth(res);return;}
	    	var token = {};
	    	token.token = uuid.v4() + "." + uuid.v1() + "." + uuid.v4();
	    	mongoDBHandler.insert("tempAuthToken",{
	    			userid : user,
	    			token : token.token
	    		},
	    		function(err,result){
	    			if(err){sendUnAuth(res);return;}
			    	sendHTTPResponse({
			    		httpCode : 200,
			    		contentType : 'application/json',
			    		content : token,
			    		oResponse : res
			    	});
	    		}
	    	)
	    }
    );
});

app.get('/callback',function(req,res){
	//get the token and redirectUri from the query string
	//if valid token, send the user data to redirectUri
	var url_parts = url.parse(req.url, true);
	var redirectUri = url_parts.query.redirectUri;
	var token = url_parts.query.token;
    mongoDBHandler.read("tempAuthToken",{
	    	token:token
	    },function(err,result){
	    	if(err){sendUnAuth(res);return;}
	    	if(result.length<=0){sendUnAuth(res);return;}
	    	var userid = result[0].userid;
	    	mongoDBHandler.delete("tempAuthToken",{token:token},null);
	    	mongoDBHandler.read("authorization",{
		    	userid:userid
		    },function(err,result){
		    	if(err){sendUnAuth(res);return;}
		    	if(result.length<=0){sendUnAuth(res);return;}
		    	var token_send = {};
		    	token_send.auth = {};
		    	token_send.auth.app = result[0].apps;
		    	token_send.auth.user = result[0].userid;
		    	token_send.auth.salt = uuid.v4();
		    	token_send.signature = privateKey.sign(token_send.auth).toString('base64');
		    	req.session.token = token_send;
		    	res.redirect(redirectUri);
		    }
	    );
	    }
    );
});
//----------------------------------------------------------------

// db.authorization.insert({
// 	userid:'niszx',
// 	userName:'Nishant Kumar',
// 	emailid : 'nishant.soft04@gmail.com',
// 	phone : '7760533699',
// 	pwd:'ebcef4a82ff8da69055221c0251e4739204029ae',
// 	apps : [
// 		{
// 			name : "SMSPromotion",
// 			roles :["admin","test"],
// 			permission:["C","R","U","D"]
// 		}
// 	]
// });
//-------------------------------------------------------------------
app.use(express.static(__dirname + '/public'));

//show login page
app.get('/', function(req, res) {
    res.sendfile('./public/login.html'); 
	var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
	delete req.session.redirectTo;
});
//--------------------------------------------------------------------------------------------
//											ADMIN APP
//--------------------------------------------------------------------------------------------
app.get('/admin/logout', function(req, res) {
	req.session.token = null;
	sendHTTPResponse({
   		httpCode : 200,
   		contentType : 'text/html',
   		content : "Successfully Logged out. You can <a href='/admin/'>login</a> again!",
   		oResponse : res
   	});
});


/**
  * Services: /AddApp, /AddValidUri, /AddUser, 
  * Desc: admin app will allow to add/update/delete/view Users, Apps, and ValidUri
  *
  */
app.get('/admin*', function(req, res) {
	if(!idpAuth.valid(req,res, APP_NAME, "admin", "R")){return;};
	
	res.sendfile('.' + req.url); 	
});

app.get('/api/admin/UserData', function(req, res) {
	if(!idpAuth.valid(req,res, APP_NAME, "admin", "R")){return;};
	
	var userid = req.session.token.auth.user;
	mongoDBHandler.read("authorization",{
		    userid:userid
		},function(err,result){
			if(err){sendUnAuth(res);return;}
		    if(result.length<=0){sendUnAuth(res);return;}
		    var userObj = {};
		    userObj.userid = result[0].userid;
		    userObj.emailid = result[0].emailid;
		    userObj.phone = result[0].phone;
		    userObj.userName = result[0].userName;
		    sendHTTPResponse({
			    httpCode : 200,
			    contentType : 'application/json',
			    content : userObj,
			    oResponse : res
			});
		}
	);
});

app.post('/api/admin/NewUser', function(req, res) {
	if(!idpAuth.valid(req,res, APP_NAME, "admin", "C")){return;};
	
	var newUser = req.body;
	mongoDBHandler.read("authorization",{userid:newUser.userid},function(err,result){
		if(err){
			sendHTTPResponse({
				httpCode : 404,
				contentType : 'application/json',
				content : {"error" : "unknow error!"},
				oResponse : res
			});
		}else if(result.length>0){
			sendHTTPResponse({
				httpCode : 404,
				contentType : 'application/json',
				content : {"error" : "User Already exists!"},
				oResponse : res
			});
		}else{
			newUser.pwd = sha1("test"); //TODO:change it to random and send mail to email id
			newUser._createdon = new Date();
			mongoDBHandler.insert("authorization",newUser,function(err,result){
				if(err){sendUnAuth(res);return;}
				sendHTTPResponse({
					httpCode : 201,
					contentType : 'application/json',
					content : {"Success" : "User Created Successfully"},
					oResponse : res
				});
			});
		}
	});
});

app.get('/api/admin/AllUsers', function(req, res) {
	if(!idpAuth.valid(req,res, APP_NAME, "admin", "R")){return;};
	
	mongoDBHandler.read("authorization",{
		    
		},function(err,result){
			if(err){sendUnAuth(res);return;}
		    if(result.length<=0){sendUnAuth(res);return;}
		    var allUsersDetails = [];
		    for(var i=0;i<result.length;i++){
		    	var userObj = {};
			    userObj.userid = result[i].userid;
			    userObj.emailid = result[i].emailid;
			    userObj.phone = result[i].phone;
			    userObj.userName = result[i].userName;
			    allUsersDetails.push(userObj);
		    }
		    
		    sendHTTPResponse({
			    httpCode : 200,
			    contentType : 'application/json',
			    content : allUsersDetails,
			    oResponse : res
			});
		}
	);
});

app.delete('/api/admin/User/:userid', function(req, res) {
	if(!idpAuth.valid(req,res, APP_NAME, "admin", "D")){return;};
	
	var userid = req.params.userid;
	if(userid == 'niszx' || userid == 'super'){sendUnAuth(res);return;}

	mongoDBHandler.delete("authorization",{
		    userid : userid
		},function(err,result){
			if(err){
				sendHTTPResponse({
				    httpCode : 400,
				    contentType : 'application/json',
				    content : {"error":"Error in Deleting user."},
				    oResponse : res
				});
			}else{
				sendHTTPResponse({
				    httpCode : 204,
				    contentType : 'application/json',
				    content : {"Success":"Successfully Deleted the User."},
				    oResponse : res
				});
			}
		}
	);
});

app.put('/api/admin/User/:userid', function(req, res) {
	if(!idpAuth.valid(req,res, APP_NAME, "admin", "U")){return;};
	
	var userid = req.params.userid;

	mongoDBHandler.read("authorization",{
		    userid : userid
		},function(err,result){
			if(err || result.length!=1){
				sendHTTPResponse({
				    httpCode : 400,
				    contentType : 'application/json',
				    content : {"error":"Error in Reading user information from database."},
				    oResponse : res
				});
			}else{
				var userObj = result[0];
				userObj.userName = req.body.userName;
				userObj.emailid = req.body.emailid;
				userObj.phone = req.body.phone;
				userObj.lastUpdate = new Date();
				mongoDBHandler.update("authorization",{userid:userid},userObj,function(err,result2){
					if(err){sendUnAuth(res);return;}
					sendHTTPResponse({
					    httpCode : 200,
					    contentType : 'application/json',
					    content : {"Success":"Successfully Updated the User."},
					    oResponse : res
					});
				});
			}
		}
	);
});

app.get('/api/admin/User/:userid', function(req, res) {
	if(!idpAuth.valid(req,res, APP_NAME, "admin", "R")){return;};
	
	var userid = req.params.userid;
	mongoDBHandler.read("authorization",{
		    userid:userid
		},function(err,result){
			if(err){sendUnAuth(res);return;}
		    if(result.length<=0){sendUnAuth(res);return;}
		    var userObj = {};
		    userObj.userid = result[0].userid;
		    userObj.emailid = result[0].emailid;
		    userObj.phone = result[0].phone;
		    userObj.userName = result[0].userName;
		    userObj.apps = result[0].apps;
		    sendHTTPResponse({
			    httpCode : 200,
			    contentType : 'application/json',
			    content : userObj,
			    oResponse : res
			});
		}
	);
});

app.put('/api/admin/User/:userid/apps', function(req, res) {
	if(!idpAuth.valid(req,res, APP_NAME, "admin", "R")){return;};
	
	var userid = req.params.userid;
	mongoDBHandler.read("authorization",{
		    userid:userid
		},function(err,result){
			if(err){sendUnAuth(res);return;}
		    if(result.length<=0){sendUnAuth(res);return;}
		    var userObj = result[0];
		    userObj.apps = req.body;
		    mongoDBHandler.update("authorization",{userid:userid},userObj,function(err){
		    	if(err){sendUnAuth(res);return;}
		    	sendHTTPResponse({
				    httpCode : 200,
				    contentType : 'application/json',
				    content : {"Success" : "User Apps Authorization Successfully Updated!"},
				    oResponse : res
				});
		    });
		}
	);
});
