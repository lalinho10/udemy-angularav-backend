const express = require('express');

const mdwAuth = require('../middlewares/authentication');
const Doctor = require('../models/doctor');

const app = express();



/***********************************************************
 * Consulta de doctores
 ***********************************************************/
app.get('/', (req, res) => {
    let pagina = req.query.pagina || 0;
    pagina = Number(pagina);

    if (pagina <= 0) {
        return res.status(406).json({
            ok: false,
            message: 'Error while getting doctors',
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
            message: 'Error while getting doctors',
            err: {
                errors: {
                    regspp: {
                        message: `El parámetro 'registros por página' debe ser mayor a 0`
                    }
                }
            }
        });
    }

    let offset = (pagina - 1) * regspp;

    Doctor.find({}).skip(offset).limit(regspp).populate('user', 'name email').populate('hospital', 'name').exec((err, doctors) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while getting doctors',
                err
            });
        }

        Doctor.countDocuments((err, numDoctors) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error while getting doctors',
                    err
                });
            }

            let limInf = offset + 1;
            let limSupTemp = (offset + regspp);
            let limSup = (limSupTemp > numDoctors) ? numDoctors : limSupTemp;

            let responseObject = {};

            if (doctors.length > 0) {
                responseObject = {
                    ok: true,
                    doctors,
                    desde: limInf,
                    hasta: limSup,
                    total: numDoctors
                };
            } else {
                responseObject = {
                    ok: true,
                    doctors
                };
            }

            res.status(200).json(responseObject);
        });
    });
});

/***********************************************************
 * Creación de un nuevo doctor
 ***********************************************************/
app.post('/', mdwAuth.verifyToken, (req, res) => {
    const body = req.body;

    const doctor = new Doctor({
        name: body.name,
        image: body.image,
        user: body.userId,
        hospital: body.hospitalId
    });

    doctor.save((err, createdDoctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while creating a doctor',
                err
            });
        }

        res.status(201).json({
            ok: true,
            doctor: createdDoctor
        });
    });
});

/***********************************************************
 * Actualización de un doctor
 ***********************************************************/
app.put('/:id', mdwAuth.verifyToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    Doctor.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updatedDoctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while updating a doctor',
                err
            });
        }

        if (!updatedDoctor) {
            return res.status(400).json({
                ok: false,
                message: 'Error while updating a doctor',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún médico con el ID proporcionado'
                        }
                    }
                }
            });
        }

        res.status(200).json({
            ok: true,
            doctor: updatedDoctor
        });
    });
});

/***********************************************************
 * Eliminación de un doctor
 ***********************************************************/
app.delete('/:id', mdwAuth.verifyToken, (req, res) => {
    let id = req.params.id;

    Doctor.findByIdAndRemove(id, (err, removedDoctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while deleting a doctor',
                err
            });
        }

        if (!removedDoctor) {
            return res.status(400).json({
                ok: false,
                message: 'Error while deleting a doctor',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún médico con el ID proporcionado'
                        }
                    }
                }
            });
        }

        res.status(200).json({
            ok: true,
            doctor: removedDoctor
        });
    });
});



module.exports = app;