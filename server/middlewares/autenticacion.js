const jwt = require('jsonwebtoken');

// ==================
// Verificar Token
// ==================

let verificaToken = ( req, res, next ) => {

    let token = req.get('token'); // Nombre de la variable enviada en el Header

    jwt.verify( token, process.env.SEED, (err, decoded) => {

        if ( err ) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        // La variable "decode" posee el payload del jwt, en este caso, la info del usuario
        // Asignamos la info del usuario al Request para que pueda ser usado en las rutas.
        req.usuario = decoded.usuario;
        next();

    });
};

// ==================
// Verificar AdminRole
// ==================

let verificaAdmin_Role = ( req, res, next ) => {

    let usuario = req.usuario; // Objeto o propiedad agregada en la función "verificaToken"

    if ( usuario.role === 'ADMIN_ROLE' ) {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
};

// ==================
// Verificar Token para imagen
// ==================

let verificaTokenImg = ( req, res, next ) => {

    let token = req.query.token; //Nombre de la variable enviada por el QueryString

    jwt.verify( token, process.env.SEED, (err, decoded) => {

        if ( err ) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        // La variable "decode" posee el payload del jwt, en este caso, la info del usuario
        // Asignamos la info del usuario al Request para que pueda ser usado en las rutas.
        req.usuario = decoded.usuario;
        next();

    });

};

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}