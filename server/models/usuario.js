const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        uppercase: true,
        trim: true,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        index: true, // Opcional si ya se definió la propiedad "unique: true"
        uniqueCaseInsensitive: true,
        trim: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        minlength: [6, 'La contraseña debe poseer al menos 6 caracteres'],
        //maxlength: [6, 'La contraseña debe poseer un máximo de 20 caracteres'],
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        uppercase: true,
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

/* Este método se usa para eliminar la contraseña del objeto respuesta
que se usa en los routes cuando se usa la función "toJSON()"
*/
usuarioSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

// Esta línea funciona para hacer que el campo email sea único, ya que tiene la propiedad "unique"
usuarioSchema.plugin( uniqueValidator, { message: '{PATH} debe de ser único' } );

module.exports = mongoose.model('Usuario', usuarioSchema);
