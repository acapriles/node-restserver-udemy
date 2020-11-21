const express = require('express');
const _ = require('underscore'); // esta librería es parecida al "lodash"
let { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

// Obtener productos
app.get('/producto', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 0;
    limite = Number(limite);

    //Cadena de texto con lo campos que se quieren mostrar
    let mostrarCampos = 'nombre precioUni descripcion';

    Producto.find( { disponible: true } , mostrarCampos)
            .sort('nombre')
            .populate('usuario' , 'nombre email') //Agrega la información de la colección "usuario"
            .populate('categoria' , 'descripcion') //Agrega la información de la colección "categoria"
            .skip(desde) //--> Desde que fila comienza a mostrar la respuesta
            .limit(limite)
            .exec((err, productosBD) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                Producto.countDocuments( { disponible: true }, ( err, conteo ) => {
                    res.status(200).json({
                        ok: true,
                        productosBD,
                        cuantos: conteo
                    });
                } );
            });
});

// Obtener producto por ID
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id; //--> lo que llega por el query string

    //Cadena de texto con lo campos que se quieren mostrar
    let mostrarCampos = 'nombre precioUni descripcion';

    Producto.find( {"disponible": true, "_id": id} , mostrarCampos)
            .populate('usuario' , 'nombre email') //Agrega la información de la colección "usuario"
            .populate('categoria' , 'descripcion') //Agrega la información de la colección "categoria"
            .exec((err, productosBD) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                if (!productosBD || productosBD.length === 0 ) {
                    return res.status(404).json({
                        ok: false,
                        err: {
                            message: 'El id no existe'
                        }
                    });
                };

                res.status(200).json({
                    ok: true,
                    producto: productosBD
                });
            });
});

// Buscar productos
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i' ); //Esto es igual al LIKE de SQL. La "i" es para que no sea sensible a las mayús y minus

    Producto.find({nombre: regex})
            .populate('categoria' , 'descripcion')
            .exec( (err, productosBD) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                res.status(200).json({
                    ok: true,
                    productos: productosBD
                });
            });
});

// Crear un nuevo producto
app.post('/producto', verificaToken, (req, res) => {
    let body = req.body; //--> Se necesita implementar el body-parser

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,  //Llega por el cuerpo del req
        //disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id //Lo retorna la función "verificaToken"
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        // Retorna el producto creado en la BD
        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });
});

// Actualizar un producto
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });

        });
    });
});

// Borrar un producto logicamente
app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let cambiaDisponible = {
        disponible: false
    }

    let options = {
        new: true, // Retorna el objeto modificado (producto)
    };

    Producto.findByIdAndUpdate(id, cambiaDisponible, options ,(err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!productoBorrado) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        };

        res.status(200).json({
            ok: true,
            producto: productoBorrado,
            message: 'Producto borrado'
        });

    });
});


module.exports = app;