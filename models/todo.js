const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//making app schema and model
const todoSchema = new Schema({
    item: {
        type: String
    }, author :{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    }

})

module.exports= mongoose.model('Todo', todoSchema)