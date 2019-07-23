const jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

exports.verifyToken = function(req, res, next) {
    const token = req.query.token ? req.query.token : req.headers['token'];

    if (!token) {
        return res.status(401).json({
            ok: false,
            message: 'Invalid token',
            err: {
                errors: {
                    token: {
                        message: 'Token inválido'
                    }
                }
            }
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