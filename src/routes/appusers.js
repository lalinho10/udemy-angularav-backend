var express = require('express');
var bcrypt = require('bcryptjs');

var mdwAuth = require('../middlewares/authentication');
var Appuser = require('../models/appuser');

var app = express();

/***********************************************************
 * Consulta de usuarios
 ***********************************************************/
app.get('/', (req, res) => {
    Appuser.find({}, { password: 0 }, (err, appusers) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while searching users',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            appusers: appusers
        });
    });
});

/***********************************************************
 * Creación de un nuevo usuario
 ***********************************************************/
app.post('/', mdwAuth.verifyToken, (req, res) => {
    var body = req.body;

    var appuser = new Appuser({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        image: body.image,
        role: body.role
    });

    appuser.save((err, createdUser) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error while creating a user',
                errors: err
            });
        }

        createdUser.password = ';)';

        res.status(201).json({
            ok: true,
            user: createdUser,
            userToken: req.user
        });
    });
});

/***********************************************************
 * Actualización de un usuario
 ***********************************************************/
app.put('/:id', mdwAuth.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Appuser.findById(id, (err, appuser) => {
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
                message: 'User with id: ' + id + ' was not found',
                errors: { message: 'No existe el usuario con el ID: ' + id }
            });
        }

        appuser.name = body.name;
        appuser.email = body.email;
        appuser.role = body.role;

        appuser.save((err, updatedUser) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error while updating a user',
                    errors: err
                });
            }

            updatedUser.password = ';)';

            res.status(200).json({
                ok: true,
                user: updatedUser
            });
        });
    });
});

/***********************************************************
 * Eliminación de un usuario
 ***********************************************************/
app.delete('/:id', mdwAuth.verifyToken, (req, res) => {
    var id = req.params.id;

    Appuser.findByIdAndRemove(id, (err, removedUser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while deleting a user',
                errors: err
            });
        }

        if (!removedUser) {
            return res.status(400).json({
                ok: false,
                message: 'User with id: ' + id + ' was not found',
                errors: { message: 'No existe el usuario con el ID: ' + id }
            });
        }

        removedUser.password = ';)';

        res.status(200).json({
            ok: true,
            user: removedUser
        });
    });
});

module.exports = app;