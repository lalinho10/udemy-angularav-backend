const mongoose = require('mongoose');

let MGSchema = mongoose.Schema;

let HospitalSchema = new MGSchema({
    name: { type: String, required: [true, 'El nombre es un dato obligatorio'] },
    image: { type: String, required: false },
    user: { type: MGSchema.Types.ObjectId, ref: 'Appuser', required: [true, 'El id del usuario es un campo obligatorio'] }
});

module.exports = mongoose.model('Hospital', HospitalSchema);