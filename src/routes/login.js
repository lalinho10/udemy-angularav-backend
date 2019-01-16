var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var Appuser = require('../models/appuser');
var SEED = require('../config/config').SEED;

var app = express();

app.post('/', (req, res) => {
    var body = req.body;

    Appuser.findOne({ email: body.email }, (err, appuser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while searching user',
                errors: err
            });
        }

        if (!appuser) {
            return res.status(400).json({
                ok: false,
                message: 'User was not found',
                errors: { message: 'Credenciales incorrectas - email' }
            });
        }

        if (!bcrypt.compareSync(body.password, appuser.password)) {
            return res.status(400).json({
                ok: false,
                message: 'User was not found',
                errors: { message: 'Credenciales incorrectas - password' }
            });
        }

        appuser.password = ':)';

        var token = jwt.sign({ user: appuser }, SEED, { expiresIn: 10 * 60 }); // 10 min

        res.status(200).json({
            ok: true,
            message: 'Successful login',
            user: appuser,
            id: appuser.id,
            token: token
        });
    });
});

module.exports = app;