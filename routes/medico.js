var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();

var Medico = require('../models/medico');

// ========================================
// obtener todos los medicos. El listado
// siempre se muestra aun no teniendo token
// ========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde) // para ir paginando se salta los desde usuarios
        .limit(5) // paginacion de 5 elementos por paginas
        .populate('usuario', 'nombre email') // con esto obtengo el objeto usuario entero asociado a este find y solo muestro id, nombre y email
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medico de BBDD',
                    errors: err
                });
            }

            Medico.count({}, (err, total) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medico de BBDD',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    medicos: medicos, //segun EM6 esto es redundante y se puede hacer solo medicos, pero asi queda mas claro
                    total: total
                });
            });
        });
});

// ========================================
// obtener un medico
// ========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Medico.findById(id).populate('usuario', 'nombre email img')
        .populate('hospital').exec((err, medico) => {
            if (err) {
                return res.status(500).json({ // 500 porque si hay error es por el servidor porque o devueve medico o null
                    ok: false,
                    mensaje: 'Error al buscar usuario en BBDD',
                    errors: err
                });
            }
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con id ' + id + ' no existe',
                    errors: { message: 'No existe medico con este ID' }
                });
            }
            res.status(200).json({
                ok: true,
                medico: medico //segun EM6 esto es redundante y se puede hacer solo medicos, pero asi queda mas claro
            });
        });
});

// ========================================
// actualizar medico
// ========================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => { // mongoose
        if (err) {
            return res.status(500).json({ // 500 porque si hay error es por el servidor porque o devueve medico o null
                ok: false,
                mensaje: 'Error al buscar usuario en BBDD',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con id ' + id + ' no existe',
                errors: { message: 'No existe medico con este ID' }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico en BBDD',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// ========================================
// crear un nuevo medico
// ========================================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    var body = req.body;
    // declaro el usuario a guardar con los datos que trae el body que son los datos del usuario
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => { // moongose
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando medico en BBDD',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

// ========================================
// borrar medico
// ========================================
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando medico en BBDD',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con id ' + id + ' no existe',
                errors: { message: 'No existe medico con este ID' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});
module.exports = app; //con esto puedo usar este fichero en cualquier parte del server