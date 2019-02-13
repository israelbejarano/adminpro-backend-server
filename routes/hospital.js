var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();

var Hospital = require('../models/hospital');

// ========================================
// obtener todos los hospitales. El listado
// siempre se muestra aun no teniendo token
// ========================================
app.get('/', (req, res, next) => {

    Hospital.find({}).exec((err, hospitales) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospital de BBDD',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospitales: hospitales //segun EM6 esto es redundante y se puede hacer solo hospitales, pero asi queda mas claro
        });
    });
});

// ========================================
// actualizar hospital
// ========================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => { // mongoose
        if (err) {
            return res.status(500).json({ // 500 porque si hay error es por el servidor porque o devueve hospital o null
                ok: false,
                mensaje: 'Error al buscar usuario en BBDD',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con id ' + id + ' no existe',
                errors: { message: 'No existe hospital con este ID' }
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital en BBDD',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// ========================================
// crear un nuevo hospital
// ========================================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    var body = req.body;
    // declaro el usuario a guardar con los datos que trae el body que son los datos del usuario
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => { // moongose
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando hospital en BBDD',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

// ========================================
// borrar hospital
// ========================================
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando hospital en BBDD',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con id ' + id + ' no existe',
                errors: { message: 'No existe hospital con este ID' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});
module.exports = app; //con esto puedo usar este fichero en cualquier parte del server