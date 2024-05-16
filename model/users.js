const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = Schema ({
    fname : { type: String, required: true},
    lname : {type: String, required: true},
    gender : {type: String, default : "female"},
    age : {type: Number, required: true},
    email : {type: String, required: true},
    password : {type: String, required: true},
    posts : [{type: Schema.Types.ObjectId, ref : "Post"}]
})
module.exports = mongoose.model('User', User);