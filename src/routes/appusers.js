const express = require('express');
const bcrypt = require('bcryptjs');

const mdwAuth = require('../middlewares/authentication');
const Appuser = require('../models/appuser');

const app = express();



/***********************************************************
 * Consulta de usuarios
 ***********************************************************/
app.get('/', (req, res) => {
    let page = req.query.page || 0;
    page = Number(page);

    if (page <= 0) {
        return res.status(406).json({
            ok: false,
            message: 'Error while getting users',
            err: {
                errors: {
                    pagina: {
                        message: `El parámetro 'página' debe ser mayor a 0`
                    }
                }
            }
        });
    }

    let regspp = req.query.regspp || 5;
    regspp = Number(regspp);

    if (regspp <= 0) {
        return res.status(406).json({
            ok: false,
            message: 'Error while getting users',
            err: {
                errors: {
                    regspp: {
                        message: `El parámetro 'registros por página' debe ser mayor a 0`
                    }
                }
            }
        });
    }

    let offset = (page - 1) * regspp;

    Appuser.find({}, 'name email image role google').skip(offset).limit(regspp).exec((err, users) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while getting users',
                err
            });
        }

        Appuser.countDocuments((err, numUsers) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error while getting users',
                    err
                });
            }

            let limInf = offset + 1;
            let limSupTemp = (offset + regspp);
            let limSup = (limSupTemp > numUsers) ? numUsers : limSupTemp;

            let responseObject = {};

            if (users.length > 0) {
                responseObject = {
                    ok: true,
                    users,
                    from: limInf,
                    to: limSup,
                    total: numUsers,
                    lastPage: (limSupTemp > numUsers)
                };
            } else {
                responseObject = {
                    ok: true,
                    users
                };
            }

            res.status(200).json(responseObject);
        });
    });
});

/***********************************************************
 * Creación de un nuevo usuario
 ***********************************************************/
app.post('/', (req, res) => {
    const body = req.body;

    const appuser = new Appuser({
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
                err
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
    const id = req.params.id;
    const body = req.body;

    Appuser.findById(id, (err, appuser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while updating user',
                err
            });
        }

        if (!appuser) {
            return res.status(400).json({
                ok: false,
                message: 'Error while updating a user',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún usuario con el ID proporcionado'
                        }
                    }
                }
            });
        }

        appuser.name = body.name;
        appuser.email = body.email;
        appuser.role = body.role;

        appuser.save((err, updatedUser) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error while updating a user',
                    err
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
    const id = req.params.id;

    Appuser.findByIdAndRemove(id, (err, removedUser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while deleting a user',
                err
            });
        }

        if (!removedUser) {
            return res.status(400).json({
                ok: false,
                message: 'Error while deleting a user',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún usuario con el ID proporcionado'
                        }
                    }
                }
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