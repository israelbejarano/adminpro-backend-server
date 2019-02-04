var express = require('express');
var app = express();

var Usuario = require('../models/usuario');

app.get('/', (req, res, next) => {

    // Usuario.find({}, (err, usuarios) => {    // devuelve todo el objeto usuario sin mas
    Usuario.find({}, 'nombre email img role').exec((err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuario de BBDD',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            usuarios: usuarios //segun EM6 esto es redundante y se puede hacer solo usuarios, pero asi queda mas claro
        });
    });
});

module.exports = app; //con esto puedo usar este fichero en cualquier parte del server