var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i'); // creo una expresion regular para hacer el termino de busqueda insenible a mayus/minus

    buscarHospitales(busqueda, regex).then(hospitales => {
        res.status(200).json({
            ok: true,
            hospitales: hospitales
        });
    });
});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex }, (err, hospitales) => {
            if (err) {
                reject('Error al cargar hospitales ', err);
            } else {
                resolve(hospitales);
            }
        });
    });

}
module.exports = app; //con esto puedo usar este fichero en cualquier parte del server