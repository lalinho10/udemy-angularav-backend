const express = require('express');

const mdwAuth = require('../middlewares/authentication');
const Hospital = require('../models/hospital');
const Appuser = require('../models/appuser');

const app = express();



/***********************************************************
 * Consulta de hospitales
 ***********************************************************/
app.get('/', (req, res) => {
    let page = req.query.page || 0;
    page = Number(page);

    if (page <= 0) {
        return res.status(406).json({
            ok: false,
            message: 'Error while getting hospitals',
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
            message: 'Error while getting hospitals',
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

    Hospital.find({}).skip(offset).limit(regspp).populate('user', 'name email').exec((err, hospitals) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while getting hospitals',
                err
            });
        }

        Hospital.countDocuments((err, numHospitals) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error while getting hospitals',
                    err
                });
            }

            let limInf = offset + 1;
            let limSupTemp = (offset + regspp);
            let limSup = (limSupTemp > numHospitals) ? numHospitals : limSupTemp;

            let responseObject = {};

            if (hospitals.length > 0) {
                responseObject = {
                    ok: true,
                    hospitals,
                    from: limInf,
                    to: limSup,
                    total: numHospitals,
                    lastPage: (limSupTemp >= numHospitals)
                };
            } else {
                responseObject = {
                    ok: true,
                    hospitals
                };
            }

            res.status(200).json(responseObject);
        });
    });
});

/***********************************************************
 * Creación de un nuevo hospital
 ***********************************************************/
app.post('/', mdwAuth.verifyToken, (req, res) => {
    const body = req.body;

    Appuser.findById(body.userId, (err, appuserDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while creating a hospital',
                err
            });
        }

        if (!appuserDB) {
            return res.status(400).json({
                ok: false,
                message: 'Error while creating a hospital',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún usuario con el ID proporcionado'
                        }
                    }
                }
            });
        }

        const hospital = new Hospital({
            name: body.name,
            user: body.userId
        });

        hospital.save((err, createdHospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error while creating a hospital',
                    err
                });
            }

            res.status(201).json({
                ok: true,
                hospital: createdHospital
            });
        });
    });
});

/***********************************************************
 * Actualización de un hospital
 ***********************************************************/
app.put('/:id', mdwAuth.verifyToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Hospital.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updatedHospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while updating a hospital',
                err
            });
        }

        if (!updatedHospital) {
            return res.status(400).json({
                ok: false,
                message: 'Error while updating a hospital',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún hospital con el ID proporcionado'
                        }
                    }
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: updatedHospital
        });
    });
});

/***********************************************************
 * Eliminación de un hospital
 ***********************************************************/
app.delete('/:id', mdwAuth.verifyToken, (req, res) => {
    let id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, removedHospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while deleting a hospital',
                err
            });
        }

        if (!removedHospital) {
            return res.status(400).json({
                ok: false,
                message: 'Error while deleting a hospital',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún hospital con el ID proporcionado'
                        }
                    }
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: removedHospital
        });
    });
});



module.exports = app;