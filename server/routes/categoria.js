const express = require('express');
const _ = require('underscore'); // esta librería es parecida al "lodash"
let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

/* Listar las categorías */
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
            .sort('descripcion') //Campo que se usa para ordenar
            .populate('usuario' , 'nombre email') //Agrega la información de la colección "usuario"
            .exec((err, categorias) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.status(200).json({
                    ok: true,
                    categorias,
                });

            });
});

//Mostrar una categría por ID
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id; //--> lo que llega por el query string

    Categoria.findById(id)
            .exec((err, categoria) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                if (!categoria) {
                    return res.status(404).json({
                        ok: false,
                        err: {
                            message: 'El id no existe'
                        }
                    });
                };

                res.status(200).json({
                    ok: true,
                    categoria
                });
            });
});

/* Crear las categorías */
app.post('/categoria', verificaToken, (req, res) => {

    let categoria = new Categoria({
        descripcion: req.body.descripcion,  //Llega por el cuerpo del req
        usuario: req.usuario._id //Lo retorna la función "verificaToken"
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        // Retorna la categoría creada en la BD
        res.status(201).json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

/* Actualizar una categoría */
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id; //--> lo que llega por el query string

    let cambiaDescripcion = {
        descripcion: req.body.descripcion
    }

    let options = {
        new: true, // Retorna el objeto modificado (categoria)
        runValidators: true //Aplica las validaciones definidas en el Schema
    };

    Categoria.findByIdAndUpdate(id, cambiaDescripcion, options, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        };

        res.status(200).json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

/* Eliminar físicamente una Categoría */
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!categoriaBorrada) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        };

        res.status(200).json({
            ok: true,
            message: 'Categoría borrada'
        });

    });
});


module.exports = app;