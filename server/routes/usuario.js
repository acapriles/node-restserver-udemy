const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore'); // esta librería es parecida al "lodash"
const Usuario = require('../models/usuario');
const usuario = require('../models/usuario');

const app = express();


app.get('/usuario', function (req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 0;
    limite = Number(limite);

    let mostrarCampos = 'nombre email password img role estado google';

    Usuario.find( { estado:true } , mostrarCampos)
            .skip(desde) //--> Desde que fila comienza a mostrar la respuesta
            .limit(limite)
            .exec((err, usuarios) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                Usuario.count( { estado: true }, ( err, conteo ) => {
                    res.status(200).json({
                        ok: true,
                        usuarios,
                        cuantos: conteo
                    });
                } );
            });

});

app.post('/usuario', function (req, res) {
    let body = req.body; //--> Se necesita implementar el body-parser

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Para que el valor del password no se retorne en la respuesta.
        // usuarioDB.password = null;

        // Retorna el usuario creado en la BD
        res.status(201).json({
            ok: true,
            usuario: usuarioDB
        });
    });
});


/* Actualizar los registros */
app.put('/usuario/:id', function (req, res) {

    let id = req.params.id; //--> lo que llega por el query string

    let body = _.pick( req.body, ['nombre', 'email', 'img', 'role', 'estado'] ); // Los campos que se pueden actualizar 

    /* Elimina una propiedad del objeto */
    //delete body.role;
    //delete body.password;

    let options = {
        new: true, // Retorna el objeto modificado (usuario)
        runValidators: true //Aplica las validaciones definidas en el Schema
    };

    Usuario.findByIdAndUpdate(id, body, options, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        res.status(200).json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.delete('/usuario/:id', function (req, res) {

    let id = req.params.id;

    let cambiaEstado = {
        estado: false
    }

    let options = {
        new: true, // Retorna el objeto modificado (usuario)
    };

    Usuario.findByIdAndUpdate(id, cambiaEstado, options ,(err, usuarioBorrado) => {
    //Usuario.findByIdAndRemove( id, ( err, usuarioBorrado ) => { //Eliminación física
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!usuarioBorrado) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        };

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;