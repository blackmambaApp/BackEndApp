const mongoose = require('mongoose');

const uri = "mongodb+srv://admin:<Q1R2s3u4>@cluster0.vfjbi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
const connection = mongoose.connection;

connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

module.exports = mongoose;