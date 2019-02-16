var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var app = express();

var Usuario = require('../models/usuario');

// Google vars
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

// ========================================
// Autenticación mediante Google.
// ========================================
async function verify(token) { // jshint ignore:line
    const ticket = await client.verifyIdToken({ // jshint ignore:line
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub']; // no me hace falta, en le return mando todo lo que me interesa para este caso
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
app.post('/google', (req, res) => {

    var token = req.body.token;
    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET);
    const ticket = client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
    });
    ticket.then(data => {
        Usuario.findOne({ email: data.payload.email }, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuario de BBDD',
                    errors: err
                });
            }
            if (usuarioDB) {
                if (usuarioDB.google === false) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe usar autenticación normal',
                        errors: err
                    });
                } else {
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 14400 son 4 horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                    });
                }

            } else {
                // el usuario no existe hay que crearlo
                var usuario = new Usuario();
                usuario.nombre = data.payload.name;
                usuario.email = data.payload.email;
                usuario.img = data.payload.picture;
                usuario.password = ':)';
                usuario.google = true;

                usuario.save((err, usuarioDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error guardando usuario de BBDD',
                            errors: err
                        });
                    }
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 14400 son 4 horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                    });
                });

            }
        });
        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Google login ok.',
        //     ticket: data.payload,
        //     userid: data.payload.sub
        // });
    }).catch(err => {
        if (err) {
            return res.status(403).json({
                ok: false,
                mensaje: 'Invalid Token',
                errors: err
            });
        }
    });
});

// ========================================
// Autenticación normal.
// ========================================
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
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 14400 son 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id
        });
    });
});


module.exports = app;