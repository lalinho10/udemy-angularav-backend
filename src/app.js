var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var appRoutes = require('./routes/app');
var loginRoutes = require('./routes/login');
var usersRoutes = require('./routes/appusers');

var app = express();

mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;
    console.log('MongoDB server listening on port 27017');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/users', usersRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

app.listen(3000, () => {
    console.log('Express server listening on port 3000');
});