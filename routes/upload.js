var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    var tiposValidos = ['usuarios', 'medicos', 'hospitales'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida',
            errors: { message: 'Las colecciones válidas son: ' + tiposValidos.join(',') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se ha seleccionado nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // validaciones
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Debe seleccionar una extensión válida: ' + extensionesValidas.join(',') }
        });
    }

    // nombre de imagen para subir es id usuario-numero random.extension
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // guardar la imagen en un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo al path',
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);

    });

});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuario de BBDD',
                    errors: err
                });
            }
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el usuario en BBDD',
                    errors: { message: 'No existe el usuario en BBDD' }
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            // si existe el archivo lo borra
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medico de BBDD',
                    errors: err
                });
            }
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el medico en BBDD',
                    errors: { message: 'No existe el medico en BBDD' }
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;
            // si existe el archivo lo borra
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital de BBDD',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el hospital en BBDD',
                    errors: { message: 'No existe el hospital en BBDD' }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            // si existe el archivo lo borra
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}
module.exports = app; //con esto puedo usar este fichero en cualquier parte del server