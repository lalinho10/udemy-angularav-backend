const express = require('express');

//const mdwAuth = require('../middlewares/authentication');
const Appuser = require('../models/appuser');
const Hospital = require('../models/hospital');
const Doctor = require('../models/doctor');

const app = express();



/***********************************************************
 * Búsqueda específica por colección
 ***********************************************************/
app.get('/collection/:colName/:search', (req, res) => {
    var colName = req.params.colName;
    var search = req.params.search;
    var regexSearch = new RegExp(search, 'i');

    var promise;

    switch (colName) {
        case 'appusers':
            promise = searchUsers(regexSearch);
            break;
        case 'doctors':
            promise = searchDoctors(regexSearch);
            break;
        case 'hospitals':
            promise = searchHospitals(regexSearch);
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
            break;
    }

    promise.then(results => {
        res.json({
            ok: true,
            [colName]: results
        });
    });
});

/***********************************************************
 * Búsqueda general en todas las colecciones
 ***********************************************************/
app.get('/all/:search', (req, res) => {
    var search = req.params.search;
    var regexSearch = new RegExp(search, 'i');

    Promise.all([
        searchHospitals(regexSearch),
        searchDoctors(regexSearch),
        searchUsers(regexSearch)
    ]).then(results => {

        res.json({
            ok: true,
            hospitals: results[0],
            doctors: results[1],
            appusers: results[2]
        });

    }).catch(errObj => {
        res.status(500).json({
            ok: false,
            message: errObj.message,
            err: errObj.err
        });
    });
});



function searchHospitals(regexSearch) {
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regexSearch }).populate('user', 'name email').exec((err, hospitals) => {
            if (err) {
                reject({
                    message: 'Error while searching in hospitals',
                    err
                });
            } else {
                resolve(hospitals);
            }
        });
    });
}

function searchDoctors(regexSearch) {
    return new Promise((resolve, reject) => {
        Doctor.find({ name: regexSearch }).populate('user', 'name email').populate('hospital').exec((err, doctors) => {
            if (err) {
                reject({
                    message: 'Error while searching in doctors',
                    err
                });
            } else {
                resolve(doctors);
            }
        });
    });
}

function searchUsers(regexSearch) {
    return new Promise((resolve, reject) => {
        Appuser.find({ $or: [{ name: regexSearch }, { email: regexSearch }] }, 'name email role').exec((err, hospitals) => {
            if (err) {
                reject({
                    message: 'Error while searching in users',
                    err
                });
            } else {
                resolve(hospitals);
            }
        });
    });
}



module.exports = app;