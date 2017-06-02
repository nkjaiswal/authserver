module.exports = function() { 
	var mongodb = require('mongodb');
	var mongoClient = mongodb.MongoClient;
	var url = 'mongodb://localhost:27017/UserData';
	
	var mongoose = require('mongoose');

	var reusable = console;
	
	this.insert = function (table,data,callback){
		mongoClient.connect(url,function(err,db){
			if(err){
				reusable.log('ERROR : Unable to connect to MongoDB');
				callback(err)
			}else{
				var collection = db.collection(table);
				collection.insert(data,function(err,result){
					db.close();
					callback(err,result);
				});
			}
		});
	}

	this.read = function(table,condition,callback){
		mongoClient.connect(url,function(err,db){
			if(err){
				reusable.log('ERROR : Unable to connect to MongoDB');
				callback(err)
			}else{
				db.collection(table, function(error, collection) {
        			collection.find(condition).toArray(function(err,result){
        				db.close();
        				callback(err,result)
        			});
  				});
			}
		});
	}

	
	this.update = function(table,condition,jsonData,callback){
		mongoClient.connect(url,function(err,db){
			if(err){
				reusable.log('ERROR : Unable to connect to MongoDB');
				callback(err)
			}else{
				db.collection(table, function(error, collection) {
        			collection.update(condition,{ $set : jsonData },function(err,result){
        				db.close();
        				callback(err,result)
        			});
  				});
			}
		});
	}

	this.delete = function(table,condition,callback){
		mongoClient.connect(url,function(err,db){
			if(err){
				reusable.log('ERROR : Unable to connect to MongoDB');
				callback(err)
			}else{
				db.collection(table, function(error, collection) {
        			collection.remove(condition,function(err,result){
        				db.close();
        				callback(err,result)
        			});
  				});
			}
		});
	}
}