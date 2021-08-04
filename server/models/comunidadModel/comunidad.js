const mongoose = require('mongoose');
const {Schema} = mongoose;
var Users = mongoose.model('Users');

const comunidad_schema = new Schema({
    name: {type:String, required:true, unique:true},
    password: {type:String, required:false},
    numIntegrants: {type:Number, required:true},
    budget: {type: Number, required:true},
    jugadoresMaximosMercado: {type: Number, required: true},
    maxDaysPlayerOnMarket: {type: Number, required: true},
    playersForUserInMarket: {type: Number, required: true},
    type: {
        type:String,
        enum: ['Public', 'Private'],
        default: 'Public'
    },
    owner: {
        type: Schema.ObjectId,
        ref: 'Users'
    },
    users: [{
        type: Schema.ObjectId,
        ref: 'Users'
    }],
    teams: [{
        type: Schema.ObjectId,
        ref: 'Equipo'
    }],
    players: [{}],
});

module.exports = mongoose.model('Comunidad', comunidad_schema);