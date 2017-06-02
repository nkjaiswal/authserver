var express    = require('express')
var bodyParser = require('body-parser')
var app = express()
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');


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

app.get('/oauth/getToken',function(req,res){
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
	    	token.auth = {};
	    	token.auth.app = result[0].apps;
	    	token.auth.user = result[0].userid;
	    	token.sign = privateKey.sign(token.auth).toString('base64');
	    	sendHTTPResponse({
	    		httpCode : 200,
	    		contentType : 'application/json',
	    		content : token,
	    		oResponse : res
	    	});
	    }
    );
});
//----------------------------------------------------------------

// db.authorization.insert({
// 	userid:'niszx',
// 	pwd:'ebcef4a82ff8da69055221c0251e4739204029ae',
// 	apps : [
// 		{
// 			name : "SMSPromotion",
// 			roles :["admin","test"],
// 			permission:["C","R","U","D"]
// 		}
// 	]
// });