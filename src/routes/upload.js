const fs = require('fs');
const path = require('path');

const express = require('express');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');

const mdwAuth = require('../middlewares/authentication');
const Appuser = require('../models/appuser');
const Hospital = require('../models/hospital');
const Doctor = require('../models/doctor');

const app = express();

app.use(fileUpload());



/***********************************************************
 * Carga de imágenes
 ***********************************************************/

app.put('/:type/:id', mdwAuth.verifyToken, (req, res) => {
    const allowedExts = ['png', 'jpg', 'jpeg', '.gif'];
    const allowedTypes = ['doctors', 'hospitals', 'users'];

    let id = req.params.id;
    let type = req.params.type;

    if (allowedTypes.indexOf(type) === -1) {
        return res.status(400).json({
            ok: false,
            message: 'Error while uploading files',
            err: {
                errors: {
                    id: {
                        message: 'El tipo seleccionado no es permitido'
                    }
                }
            }
        });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            ok: false,
            message: 'Error while uploading files',
            err: {
                errors: {
                    id: {
                        message: 'El ID selecciondo no es válido'
                    }
                }
            }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'Error while uploading files',
            err: {
                errors: {
                    id: {
                        message: 'No hay archivos para cargar'
                    }
                }
            }
        });
    }

    let file = req.files.image;
    let fileExt = file.name.split('.').pop();
    fileExt = fileExt.toLowerCase();

    if (allowedExts.indexOf(fileExt) === -1) {
        return res.status(400).json({
            ok: false,
            message: 'Error while uploading files',
            err: {
                errors: {
                    id: {
                        message: 'El tipo de archivo seleccionado no es permitido'
                    }
                }
            }
        });
    }

    let serverFileName = `${ id }-${ new Date().getTime() }.${ fileExt }`;

    file.mv(`src/uploads/${ type }/${ serverFileName }`, function(err) {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while uploading files',
                err
            });
        }

        if (type === 'users') {
            updateUserImage(id, serverFileName, res);
        } else if (type === 'hospitals') {
            updateHospitalImage(id, serverFileName, res);
        } else if (type === 'doctors') {
            updateDoctorImage(id, serverFileName, res);
        }
    });
});

function updateUserImage(idUser, imageName, res) {
    Appuser.findById(idUser, (err, usuarioDB) => {
        if (err) {
            removeImageFromFS(imageName, 'users');

            return res.status(500).json({
                ok: false,
                message: 'Error while getting a user',
                err
            });
        }

        if (!usuarioDB) {
            removeImageFromFS(imageName, 'users');

            return res.status(400).json({
                ok: false,
                message: 'Error while getting a user',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún usuario con el ID proporcionado'
                        }
                    }
                }
            });
        }

        removeImageFromFS(usuarioDB.image, 'users');

        usuarioDB.image = imageName;

        usuarioDB.save((err, usuarioUpd) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error while creating a user',
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioUpd
            });
        });
    });
}

function updateHospitalImage(idUser, imageName, res) {
    Hospital.findById(idUser, (err, hospitalDB) => {
        if (err) {
            removeImageFromFS(imageName, 'hospitals');

            return res.status(500).json({
                ok: false,
                message: 'Error while getting a hospital',
                err
            });
        }

        if (!hospitalDB) {
            removeImageFromFS(imageName, 'hospitals');

            return res.status(400).json({
                ok: false,
                message: 'Error while getting a hospital',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún hospital con el ID proporcionado'
                        }
                    }
                }
            });
        }

        removeImageFromFS(hospitalDB.image, 'hospitals');

        hospitalDB.image = imageName;

        hospitalDB.save((err, hospitalUpd) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error while creating a hospital',
                    err
                });
            }

            res.json({
                ok: true,
                hospital: hospitalUpd
            });
        });
    });
}

function updateDoctorImage(idUser, imageName, res) {
    Doctor.findById(idUser, (err, doctorDB) => {
        if (err) {
            removeImageFromFS(imageName, 'doctors');

            return res.status(500).json({
                ok: false,
                message: 'Error while getting a doctor',
                err
            });
        }

        if (!doctorDB) {
            removeImageFromFS(imageName, 'doctors');

            return res.status(400).json({
                ok: false,
                message: 'Error while getting a doctor',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún médico con el ID proporcionado'
                        }
                    }
                }
            });
        }

        removeImageFromFS(doctorDB.image, 'doctors');

        doctorDB.image = imageName;

        doctorDB.save((err, doctorUpd) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error while creating a doctor',
                    err
                });
            }

            res.json({
                ok: true,
                doctor: doctorUpd
            });
        });
    });
}

function removeImageFromFS(imageName, type) {
    let imagePath = path.resolve(__dirname, `../uploads/${ type }/${ imageName }`);

    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
}



module.exports = app;