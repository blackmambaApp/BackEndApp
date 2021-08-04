const mongoose = require('mongoose');
const {Schema} = mongoose;

//Creamos el esquema para un usuario

const journey_schema = new Schema({
    journeyNumber: {type:Number, required:true, unique: true},
    playersPoints: [{}],
    date: {type: Date, required: true}
});

module.exports = mongoose.model('Jornada', journey_schema);