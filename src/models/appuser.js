var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var VALID_ROLES = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var MGSchema = mongoose.Schema;

var AppuserSchema = new MGSchema({
    name: { type: String, required: [true, 'El nombre es un dato obligatorio'] },
    email: { type: String, unique: true, required: [true, 'El correo electrónico es un dato obligatorio'] },
    password: { type: String, required: [true, 'La contraseña es un dato obligatorio'] },
    image: { type: String, required: false },
    role: { type: String, required: [true, 'El rol es un dato obligatorio'], default: 'USER_ROLE', enum: VALID_ROLES }
});

AppuserSchema.plugin(uniqueValidator, { message: 'El campo {PATH} debe ser único' });

module.exports = mongoose.model('Appuser', AppuserSchema);