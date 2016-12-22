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
  var newFormulaire = new Formulaire({
    id: request.body.id,
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    chiffrages: request.body.chiffrages
  });
  newFormulaire.save(function(err, savedFormulaire){
    if (err) {
      response.status(500).send();
      return console.log(err);
    }
    response.send(savedFormulaire);
  });
});

app.get('/:id', function (request, response) {
  var idMatcher = /^[A-Za-z\d_-]{7,14}$/i;
  if (request.params.id.match(idMatcher)){
    Formulaire.find({id: request.params.id}, function(err, formulaire){
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
  var idMatcher = /^[A-Za-z\d_-]{7,14}$/i;
  if (request.params.id.match(idMatcher)){
    Formulaire.findOne({id: request.params.id}, function(err, formulaire){
      if (err){
        return console.log(err);
      }
      if (!formulaire) {
        var newFormulaire = new Formulaire({
          id: request.body.id,
          firstName: request.body.firstName,
          lastName: request.body.lastName,
          chiffrages: request.body.chiffrages
        });
        return newFormulaire.save(function(err, savedFormulaire){
          if (err) {
            response.status(500).send();
            return console.log(err);
          }
          response.send(savedFormulaire);
        });
      }

      formulaire.firstName = request.body.firstName;
      formulaire.lastName = request.body.lastName;
      formulaire.chiffrages = request.body.chiffrages;

      formulaire.save(function(err, savedFormulaire){
        if (err) {
          return console.log(err);
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
  var idMatcher = /^[A-Za-z\d_-]{7,14}$/i;
  if (request.params.id.match(idMatcher)){
    Formulaire.remove({id: request.params.id}, function(err){
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

app.delete('/', function(request, response){
  mongoose.connection.db.dropDatabase();
  response.send();
});

mongoose.connect(mongoUrl);
var mongoDb = mongoose.connection;
mongoDb.on('error', console.error.bind(console, 'Can\'t connect to MongoDB.'));
mongoDb.on('open', function(){
  console.log('Connected to MongoDB, launch service...');
  app.listen(port, function () {
    console.log('App listening on port ' + port + '!');
  });
});
