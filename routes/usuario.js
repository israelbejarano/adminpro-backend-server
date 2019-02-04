var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();

var Usuario = require('../models/usuario');

// ========================================
// obtener todos los usuarios
// ========================================
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

// ========================================
// crear un nuevo usuario
// ========================================
app.post('/', (req, res) => {
    var body = req.body;
    // declaro el usuario a guardar con los datos que trae el body que son los datos del usuario
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => { // moongose
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando usuario en BBDD',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });
    });
});

// ========================================
// Actualizar un nuevo usuario
// ========================================

module.exports = app; //con esto puedo usar este fichero en cualquier parte del server