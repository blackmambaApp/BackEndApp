const mongoose = require('mongoose');
const {Schema} = mongoose; 
// const {Jugador} = mongoose.Schema('Jugador');
// const {Users} = moongoose.Schema('Users');

const equipo_schema = new Schema ({
    name: {type:String, required: true, unique:true},
    image: {type:String, required: false},
    budget: {type:Number, required:true}, 
    numPlayers: {type:Number, required:true},
    points: {type:Number, default: 0},
    players: [{
        _id : {type: String},
        name: {type:String, required: true},
        position: { type:String, enum:['A','AP','B','P','E'] },
        transferValue: {type:Number},
        status: { type:String, enum: ['Transferible','Libre','ConEquipo'] },
        realTeam: {type:String, required:true},
        realTeamImg: {type:String},
        playerImg: {type:String},
        points: {type: Number, default: 0}
    }],
    user: { 
        type: Schema.ObjectId,
        ref: "Users"
    },
    comunidad :{
        type: Schema.ObjectId,
        ref: "Comunidad"
    },
    alignedPlayers: [{}]
});

module.exports = mongoose.model('Equipo', equipo_schema);