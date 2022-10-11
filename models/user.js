const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;
const Todo = require("./todo")
const userSchema = new Schema({
    email: {
        type: String,
        required : true,
        unique : true
    },
    todos: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Todo' 
    }]
})

userSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', userSchema)