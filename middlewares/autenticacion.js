var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
// ========================================
// Verificar token. Es un middleware.
// si no pasa la validacion del token el resto
// de funciones no se ejecuta.
// ========================================
exports.verificarToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'invalid token',
                errors: err
            });
        }
        // esto es para en el postman ver lo que trae el decoded
        // res.status(200).json({
        // ok: true,
        // decoded: decoded
        // });
        req.usuario = decoded.usuario;
        next(); // si pasa el filtro del token este next habilita el resto de funcionalidad
    });
}