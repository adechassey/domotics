var MongoClient = require('mongodb');

var Server = MongoClient.Server,
    Db = MongoClient.Db,
    BSON = MongoClient.BSONPure;

var server = new Server('antoinedechassey.fr', 27017, {auto_reconnect: true});
db = new Db('weather', server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'weather' database");
        db.collection('weathers', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'weathers' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving weather: ' + id);
    db.collection('weathers', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('weathers', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addWeather = function(req, res) {
    var weather = req.body;
    console.log('Adding weather: ' + JSON.stringify(weather));
    db.collection('weathers', function(err, collection) {
        collection.insert(weather, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result.ops,null,4));
                res.send('ID: ' + result.ops[0]._id);
            }
        });
    });
}

exports.updateWeather = function(req, res) {
    var id = req.params.id;
    var weather = req.body;
    console.log('Updating weather: ' + id);
    console.log(JSON.stringify(weather));
    db.collection('weathers', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, weather, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating weather: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(weather);
            }
        });
    });
}

exports.deleteWeather = function(req, res) {
    var id = req.params.id;
    console.log('Deleting weather: ' + id);
    db.collection('weathers', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    var weathers = [
        {
            temperature: 30,
            humidity: 20,
            "heatIndex": 12.60,
            time: "2010"
        },
        {
            temperature: 12,
            humidity: 40,
            "heatIndex": 12.60,
            time: "2009"
        }];

    db.collection('weathers', function(err, collection) {
        collection.insert(weathers, {safe:true}, function(err, result) {});
    });
};