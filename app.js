var express = require('express');
var mongoose = require('mongoose');

var app = express();

mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;
    console.log('MongoDB server listening on port 27017');
});

app.get('/', (req, res) => {
    res.status(200).json({
        status: 200,
        message: 'Request complete',
        data: {
            message: 'Welcome home!'
        }
    });
});

app.listen(3000, () => {
    console.log('Express server listening on port 3000');
});