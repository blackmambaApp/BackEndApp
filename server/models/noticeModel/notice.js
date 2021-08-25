const mongoose = require('mongoose');
const {Schema} = mongoose; 


const notice_schema = new Schema ({
    comunity: {type:String, required: true},
    content: {type:String, required: true},
    team: {},
    offer: {
        type: Schema.ObjectId,
        ref: 'Offers'
    },
    type: {
        type:String,
        enum:['Transfer','TeamIn', 'TeamOut']
    },
    status: {
        type:String,
        enum:['Showed','NotShowed']
    },
    users: [{
        type: Schema.ObjectId,
        ref: 'Users'
    }],
    dateOfNotice: {type: Date, default: Date.now },
})

module.exports = mongoose.model('Notice', notice_schema);