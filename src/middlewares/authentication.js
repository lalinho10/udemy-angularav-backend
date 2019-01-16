var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

exports.verifyToken = function(req, res, next) {
    var token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({
            ok: false,
            message: 'Invalid token',
            errors: { mesage: 'Token inválido' }
        });
    } else {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }

        jwt.verify(token, SEED, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    ok: false,
                    message: 'Invalid token',
                    errors: err
                });
            }

            req.user = decoded.user;

            next();
        });
    }
};