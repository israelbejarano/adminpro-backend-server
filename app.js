// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar varliables
var app = express();

// Conexion a BBDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('BBDD en puerto 27017: \x1b[32m%s\x1b[0m', 'online');
});

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// Escuchas
app.listen(3000, () => {
    console.log('Node/Express en puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});