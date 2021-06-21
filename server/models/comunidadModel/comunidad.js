const mongoose = require('mongoose');
const {Schema} = mongoose;
/* const User = require('../userModel/users')*/
var Users = mongoose.model('Users');

const comunidad_schema = new Schema({
    name: {type:String, required:true, unique:true},
    password: {type:String, required:false},
    numIntegrants: {type:Number, required:true},
    budget: {type: Number, required:true},
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
    players: [{
        type: Schema.ObjectId,
        ref: 'Jugador'
    }]
});

module.exports = mongoose.model('comunidad', comunidad_schema);