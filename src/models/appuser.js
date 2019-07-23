const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const VALID_ROLES = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

let MGSchema = mongoose.Schema;

let AppuserSchema = new MGSchema({
    name: { type: String, required: [true, 'El nombre es un dato obligatorio'] },
    email: { type: String, unique: true, required: [true, 'El correo electrónico es un dato obligatorio'] },
    password: { type: String, required: [true, 'La contraseña es un dato obligatorio'] },
    image: { type: String, required: false },
    role: { type: String, required: [true, 'El rol es un dato obligatorio'], default: 'USER_ROLE', enum: VALID_ROLES },
    google: { type: Boolean, default: false }
});

AppuserSchema.plugin(uniqueValidator, { message: 'El campo {PATH} debe ser único' });

module.exports = mongoose.model('Appuser', AppuserSchema);