const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create Redis Client
let client = redis.createClient();

client.on('connect', function () {
  console.log('Connected to Redis...');
});

// Set Port
const port = 3000;

// Init app
const app = express();

// View Engine\
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// methodOverride
app.use(methodOverride('_method'));

// Search Page (DISPLAY)
app.get('/', (req, res, next) => {
  res.render('searchtickets');
});


// Add Ticket Page (DISPLAY)
app.get('/ticket/add', (req, res, next) => {
  res.render('addticket');
});

app.get('/ticket/update/:id', (req, res, next) => {
  const { id } = req.params;

  client.hgetall(id, (err, obj) => {
    if (!obj) {
      res.render('searchtickets', {
        error: 'Bilet nie istnieje'
      });
    } else {
      obj.id = id;
      res.render('updateticket', {
        ticket: obj
      });
    }
  });
});

// Update Ticket Page (UPDATE)
app.post('/ticket/update/:id', (req, res, next) => {
  const { id } = req.params;
  const { firstName, lastName, ticketType, trainName } = req.body;

  console.log(req.body)

  client.hmset(id, [
    'firstName', firstName,
    'lastName', lastName,
    'ticketType', ticketType,
    'trainName', trainName
  ], function (err, reply) {
    if (err) {
      console.log(err);
    }
    console.log(reply);
    res.redirect('/');
  });
});

// Search processing 
app.post('/ticket/search', (req, res, next) => {
  const { id } = req.body;

  client.hgetall(id, (err, obj) => {
    if (!obj) {
      res.render('searchtickets', {
        error: 'Bilet nie istnieje'
      });
    } else {
      obj.id = id;
      res.render('details', {
        ticket: obj
      });
    }
  });
});


// Process Add User Page (CREATE)
app.post('/ticket/add', (req, res, next) => {
  const { id, firstName, lastName, ticketType, trainName } = req.body;

  client.hmset(id, [
    'firstName', firstName,
    'lastName', lastName,
    'ticketType', ticketType,
    'trainName', trainName
  ], function (err, reply) {
    if (err) {
      console.log(err);
    }
    console.log(reply);
    res.redirect('/');
  });
});

// Delete Ticket(DELETE)
app.delete('/ticket/delete/:id', function (req, res, next) {
  client.del(req.params.id);
  res.redirect('/');
});

app.listen(port, function () {
  console.log('Server started on port ' + port);
});
