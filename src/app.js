var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');



var appRoutes = require('./routes/app');
var loginRoutes = require('./routes/login');
var usersRoutes = require('./routes/appusers');
var hospitalsRoutes = require('./routes/hospitals');
var doctorsRoutes = require('./routes/doctors');
var searchRoutes = require('./routes/search');
var uploadRoutes = require('./routes/upload');
var imageRoutes = require('./routes/images');



var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/images', imageRoutes);
app.use('/upload', uploadRoutes);
app.use('/search', searchRoutes);
app.use('/doctors', doctorsRoutes);
app.use('/hospitals', hospitalsRoutes);
app.use('/users', usersRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);



const connectionOptions = {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true
};

mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', connectionOptions, (err, res) => {
    if (err) throw err;
    console.log('MongoDB server listening on port 27017');
});



app.listen(3000, () => {
    console.log('Express server listening on port 3000');
});