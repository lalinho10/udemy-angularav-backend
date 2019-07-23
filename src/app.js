const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const appRoutes = require('./routes/app');
const loginRoutes = require('./routes/login');
const usersRoutes = require('./routes/appusers');
const hospitalsRoutes = require('./routes/hospitals');
const doctorsRoutes = require('./routes/doctors');
const searchRoutes = require('./routes/search');
const uploadRoutes = require('./routes/upload');
const imageRoutes = require('./routes/images');



const app = express();

app.use(express.static(path.resolve(__dirname, '../public')));

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