const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Article = Schema({
    user : {type: Schema.Types.ObjectId, ref : 'User'},
    title : {type: String, required: true},
    body : { type : String, required: true},
    comments : [{ type: Schema.Types.ObjectId, ref : 'Comment' }]
})
module.exports = mongoose.model('Article', Article)