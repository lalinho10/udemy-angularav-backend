const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const config = require('../config/config')
const Appuser = require('../models/appuser');

const app = express();
const client = new OAuth2Client(config.CLIENT_ID);



/***********************************************************
 * Autenticación de la aplicación
 ***********************************************************/
app.post('/', (req, res) => {
    const body = req.body;

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

        const token = jwt.sign({ user: appuser }, config.SEED, { expiresIn: 10 * 60 }); // 10 min

        res.status(200).json({
            ok: true,
            message: 'Successful login',
            user: appuser,
            id: appuser.id,
            token: token
        });
    });
});

/***********************************************************
 * Autenticación de google
 ***********************************************************/
async function verify(obj) {
    const ticket = await client.verifyIdToken({
        idToken: obj.idToken,
        audience: config.CLIENT_ID
    });

    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        image: payload.picture
    };
}

app.post('/google', async(req, res) => {
    const idToken = req.body.idToken;

    const googleUser = await verify({ idToken: idToken }).catch((err) => {
        return res.status(403).json({
            ok: false,
            message: 'Error while autheticating google user',
            err
        });
    });

    Appuser.findOne({ email: googleUser.email }, (err, appuserDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while searching user',
                errors: err
            });
        }

        if (appuserDB) {
            if (appuserDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error while getting a user',
                    err: {
                        errors: {
                            id: {
                                message: 'El usuario ya existe. Favor de autenticarse normalmente'
                            }
                        }
                    }
                });
            } else {
                const token = jwt.sign({ user: appuserDB }, config.SEED, { expiresIn: 10 * 60 });

                res.json({
                    ok: true,
                    message: 'Successful login',
                    usuario: appuserDB,
                    id: appuserDB.id,
                    token: token
                });
            }
        } else {
            let appuser = new Appuser();

            appuser.name = googleUser.name;
            appuser.email = googleUser.email;
            appuser.password = ':)';
            appuser.image = googleUser.image;
            appuser.role = 'USER_ROLE';
            appuser.google = true;

            const token = jwt.sign({ usuario: appuser }, config.SEED, { expiresIn: 10 * 60 });

            appuser.save((err, createdUser) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Error while creating a user',
                        err
                    });
                }

                res.status(200).json({
                    ok: true,
                    message: 'Successful login',
                    user: createdUser,
                    id: createdUser.id,
                    token: token
                });
            });
        }
    });
});



module.exports = app;