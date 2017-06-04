var express    = require('express')
var bodyParser = require('body-parser')
var app = express()
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());
var cookieSession = require('cookie-session')
app.set('trust proxy', 1)
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))


port = 3005;
host = '127.0.0.1';
var server = app.listen(port, function(){
    console.log('Listening at http://' + host + ':' + port);    
});

app.get('/home',function(req,res){
	// req.session = {};
    if (!req.session.token) {
        res.redirect('http://myconnectedhome.info:3004/?redirectUri=http://myconnectedhome.info:3005/home');
    } else {
    	res.writeHead(200, {
        	'Content-Type' : 'application/json'
        })
        res.end(JSON.stringify(req.session.token));
    }
});
app.get('/logout',function(req,res){
    req.session.token = null;
   
        res.writeHead(200, {
            'Content-Type' : 'application/text'
        })
        res.end("Logged out!");
    
});