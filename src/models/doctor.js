const mongoose = require('mongoose');

const MGSchema = mongoose.Schema;

const DoctorSchema = new MGSchema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    image: { type: String, required: false },
    user: { type: MGSchema.Types.ObjectId, ref: 'Appuser', required: [true, 'El id del usuario es un campo obligatorio'] },
    hospital: { type: MGSchema.Types.ObjectId, ref: 'Hospital', required: [true, 'El id del hospital es un campo obligatorio'] }
});

module.exports = mongoose.model('Doctor', DoctorSchema);