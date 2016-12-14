var express = require('express'),
  mongoose = require('mongoose'),
  async = require('async'),
  bodyParser = require('body-parser');

// Data
var dataSample = require('./data');

// Schema
var Formulaire = require('./formulaire');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var port = process.env.PORT || 5000;
var mongoUrl = process.env.MONGOLAB_URI ||
               process.env.MONGODB_URI ||
               'mongodb://localhost/poc-texa';

function createEntry(formulaire, callback){
  var newFormulaire = new Formulaire({
    firstName: formulaire.firstName,
    lastName: formulaire.lastName,
    chiffrages: formulaire.chiffrages
  });
  newFormulaire.save(function(err, savedFormulaire){
    if (err) {
      console.log(err);
    }
    if (typeof callback !== 'undefined'){
      callback(err, savedFormulaire);
    }
  });
}

function initMongo() {
  console.log('Drop database ' + mongoUrl);
  mongoose.connection.db.dropDatabase();

  console.log('Inserting data for test');
  async.map(dataSample, createEntry);
}

app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  response.header('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
  next();
});

app.get('/', function (request, response) {
  Formulaire.find(function(err, result){
    if (err) {
      return console.log(err);
    }
    response.send(result);
  });
});

app.post('/', function(request, response) {
  var formulaire = {
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    chiffrages: request.body.chiffrages
  };
  createEntry(formulaire, function(err, newRecord){
    if (err) {
      return console.log(err);
    }
    response.send(newRecord);
  });
});

app.get('/:id', function (request, response) {
  var idMatcher = /^[a-f\d]{24}$/i;
  if (request.params.id.match(idMatcher)){
    Formulaire.findById(request.params.id, function(err, formulaire){
      if (err){
        return console.log(err);
      }
      if (!formulaire){
        return response.status(404).send('Document not found');
      }
      response.send(formulaire);
    });
  }
  else {
    return response.status(400).send('Incorrect ID');
  }
});

app.post('/:id', function (request, response) {
  var idMatcher = /^[a-f\d]{24}$/i;
  if (request.params.id.match(idMatcher)){
    Formulaire.findById(request.params.id, function(err, formulaire){
      if (err){
        return console.log(err);
      }
      if (!formulaire) {
        return response.status(404).send('Document not found');
      }
      formulaire.firstName = request.body.firstName;
      formulaire.lastName = request.body.lastName;
      formulaire.chiffrages = request.body.chiffrages;

      formulaire.save(function(err, savedFormulaire){
        if (err) {
          console.log(err);
        }
        response.send(savedFormulaire);
      });
    });
  }
  else {
    return response.status(400).send('Incorrect ID');
  }
});

app.delete('/:id', function(request, response) {
  var idMatcher = /^[a-f\d]{24}$/i;
  if (request.params.id.match(idMatcher)){
    Formulaire.remove({_id: request.params.id}, function(err){
      if (err) {
        return console.log(err);
      }
      return response.send("Document deleted");
    });
  }
  else {
    return response.status(400).send('Incorrect ID');
  }
});

mongoose.connect(mongoUrl);
var mongoDb = mongoose.connection;
mongoDb.on('error', console.error.bind(console, 'Can\'t connect to MongoDB.'));
mongoDb.on('open', function(){
  console.log('Connected to MongoDB, launch service...');
  initMongo();
  app.listen(port, function () {
    console.log('App listening on port ' + port + '!');
  });
});
