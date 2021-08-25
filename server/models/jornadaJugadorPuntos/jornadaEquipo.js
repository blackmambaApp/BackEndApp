const mongoose = require('mongoose');
const {Schema} = mongoose;

//Creamos el esquema para un usuario

const jornada_equipo = new Schema({
    journey: {
        type: Schema.ObjectId, 
        ref: "Jornada",
        required:true},
        
    team: {
        type: Schema.ObjectId,
        ref: "Equipo",
        required:true},
    comunity: {
        type: Schema.ObjectId, 
        ref: "Comunidad",
        required:true},
    dateOfCreation: {type: Date, default: Date.now },
    playersToPuntuate : [{}],
    playersAligned: [{}]

});

module.exports = mongoose.model('JornadaEquipo', jornada_equipo);