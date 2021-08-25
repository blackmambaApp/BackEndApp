const mongoose = require('mongoose');
const {Schema} = mongoose; 


const offer_schema = new Schema ({
    comunity: {type:String, required: true},
    status: {
        type:String,
        enum:['Inactive','Pending','Accepted','Rejected']
    },
    actualTeam: {},
    offerTeam: {},
    player: {
        type: Schema.ObjectId,
        ref: 'Jugador'
    },
    offerAmount: {type: Number},
    dateOfOffer: {type: Date, default: Date.now },
})

module.exports = mongoose.model('Offers', offer_schema);