const mongoose = require('mongoose');
const {Schema} = mongoose; 
// const {Jugador} = mongoose.Schema('Jugador');
// const {Users} = moongoose.Schema('Users');

const equipo_schema = new Schema ({
    name: {type:String, required: true, unique:true},
    budget: {type:Number, required:true}, 
    numPlayers: {type:Number, required:true},
    players: [{
        type: Schema.ObjectId,
        ref: "Jugador"
    }],
    user: { 
        type: Schema.ObjectId,
        ref: "Users"
    },
    comunidad :{
        type: Schema.ObjectId,
        ref: "Comunidad"
    },
    alignedPlayers: [{
        type: Schema.ObjectId,
        ref: "Jugador"
    }]
});

module.exports = mongoose.model('Equipo', equipo_schema);