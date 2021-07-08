const mongoose = require('mongoose');
const {Schema} = mongoose; 


const jugador_schema = new Schema ({
    name: {type:String, required: true},
    position: {
        type:String,
        enum:['A','AP','B','P','E']
    },
    transferValue: {type:Number},
    status: {
        type:String, 
        enum: ['Transferible','Libre','ConEquipo']
    },
    realTeam: {type:String, required:true},
    realTeamImg: {type:String},
    playerImg: {type:String},
    points: {type: Number, default: 0}
})

module.exports = mongoose.model('Jugador', jugador_schema);