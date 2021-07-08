const mongoose = require('mongoose');
const {Schema} = mongoose;
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
        _id : {type: String},
        name: {type:String, required: true},
        position: { type:String, enum:['A','AP','B','P','E'] },
        transferValue: {type:Number},
        status: { type:String, enum: ['Transferible','Libre','conEquipo'] },
        realTeam: {type:String, required:true},
        realTeamImg: {type:String},
        playerImg: {type:String},
        points: {type: Number, default: 0}
    }]
});

module.exports = mongoose.model('comunidad', comunidad_schema);