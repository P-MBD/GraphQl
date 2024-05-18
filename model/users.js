const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const User = Schema ({
    fname : { type: String, required: true},
    lname : {type: String, required: true},
    gender : {type: String, default : "female"},
    age : {type: Number, required: true},
    email : {type: String, required: true},
    password : {type: String, required: true},
    posts : [{type: Schema.Types.ObjectId, ref : "Comment"}]
})
User.plugin(mongoosePaginate);
module.exports = mongoose.model('User', User);