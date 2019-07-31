const express = require('express');

//const mdwAuth = require('../middlewares/authentication');
const Appuser = require('../models/appuser');
const Hospital = require('../models/hospital');
const Doctor = require('../models/doctor');

const app = express();



/***********************************************************
 * Búsqueda específica por colección
 ***********************************************************/
app.get('/collection/:colName/:search?', (req, res) => {
    const colName = req.params.colName;

    let page = req.query.page || 0;
    page = Number(page);

    if (page <= 0) {
        return res.status(406).json({
            ok: false,
            message: `Error while searching ${ colName }`,
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

    const search = req.params.search;
    const regexSearch = new RegExp(search, 'i');

    let promise;

    switch (colName) {
        case 'users':
            promise = searchUsers(regexSearch, offset, regspp);
            break;
        case 'doctors':
            promise = searchDoctors(regexSearch, offset, regspp);
            break;
        case 'hospitals':
            promise = searchHospitals(regexSearch, offset, regspp);
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: 'Error while making an specific search',
                err: {
                    errors: {
                        coleccion: {
                            message: 'La colección en la que desea realizar la búsqueda, no existe'
                        }
                    }
                }
            });
            // break;
    }

    promise.then(results => {
        res.json(results);
    }).catch(errObj => {
        res.status(500).json({
            ok: false,
            message: errObj.message,
            err: errObj.err
        });
    });
});

/***********************************************************
 * Búsqueda general en todas las colecciones
 ***********************************************************/
app.get('/all/:search', (req, res) => {
    const search = req.params.search;
    const regexSearch = new RegExp(search, 'i');

    Promise.all([
        searchHospitals(regexSearch),
        searchDoctors(regexSearch),
        searchUsers(regexSearch)
    ]).then(results => {

        res.json({
            ok: true,
            hospitals: results[0],
            doctors: results[1],
            users: results[2]
        });

    }).catch(errObj => {
        res.status(500).json({
            ok: false,
            message: errObj.message,
            err: errObj.err
        });
    });
});



function searchHospitals(regexSearch, offset, regspp) {
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regexSearch }).populate('user', 'name email').skip(offset).limit(regspp).exec((err, hospitals) => {
            if (err) {
                reject({
                    message: 'Error while searching in hospitals',
                    err
                });
            } else {
                Hospital.countDocuments({ name: regexSearch }, (err, numHospitals) => {
                    if (err) {
                        reject({
                            message: 'Error while searching in hospitals',
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
                            lastPage: (limSupTemp > numHospitals)
                        };
                    } else {
                        responseObject = {
                            ok: true,
                            hospitals
                        };
                    }

                    resolve(responseObject);
                });
            }
        });
    });
}

function searchDoctors(regexSearch, offset, regspp) {
    return new Promise((resolve, reject) => {
        Doctor.find({ name: regexSearch }).populate('user', 'name email').populate('hospital').skip(offset).limit(regspp).exec((err, doctors) => {
            if (err) {
                reject({
                    message: 'Error while searching in doctors',
                    err
                });
            } else {
                Doctor.countDocuments({ name: regexSearch }, (err, numDoctors) => {
                    if (err) {
                        reject({
                            message: 'Error while searching in doctors',
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
                            from: limInf,
                            to: limSup,
                            total: numDoctors,
                            lastPage: (limSupTemp > numDoctors)
                        };
                    } else {
                        responseObject = {
                            ok: true,
                            doctors
                        };
                    }

                    resolve(responseObject);
                });
            }
        });
    });
}

function searchUsers(regexSearch, offset, regspp) {
    return new Promise((resolve, reject) => {
        Appuser.find({ $or: [{ name: regexSearch }, { email: regexSearch }] }, 'name email image role google').skip(offset).limit(regspp).exec((err, users) => {
            if (err) {
                reject({
                    message: 'Error while searching in users',
                    err
                });
            } else {
                Appuser.countDocuments({ $or: [{ name: regexSearch }, { email: regexSearch }] }, (err, numUsers) => {
                    if (err) {
                        reject({
                            message: 'Error while searching in users',
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

                    resolve(responseObject);
                });
            }
        });
    });
}



module.exports = app;