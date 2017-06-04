var express    = require('express')
var bodyParser = require('body-parser')
var app = express()
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());

port = 3004;
host = '127.0.0.1';
var server = app.listen(port, function(){
    console.log('Listening at http://' + host + ':' + port);    
});

app.get('/home',function(req,res){
    if (!req.session) {
        req.session.redirectTo = '/home';
        res.redirect('http://www.google.com');
    } else {
        
    }
});