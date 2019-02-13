var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuario de BBDD',
                errors: err
            });
        }
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email', // este - email lo quitamos en prod pero ahora sirve para depurar
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password', // este - password lo quitamos en prod pero ahora sirve para depurar
                errors: err
            });
        }
        // generar token
        usuarioBD.password = ':)'; // para no mandar el password en la respuesta
        var token = jwt.sign({ usuario: usuarioBD }, '@this-is@-difficult-seed', { expiresIn: 14400 }); // 14400 son 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id
        });
    });
});


module.exports = app;