const mongoose = require('mongoose');
const {Schema} = mongoose;
const Usuario = mongoose.model(user);

const participante_schema = new Schema({
    usuario: {type: Schema.ObjectId, ref:"Usuario"},
    comunidad: {type: Schema.ObjectId, ref:"Comunidad"}
})


module.exports = mongoose.model('Participante', participante_schema);