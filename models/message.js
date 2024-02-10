const mongoose = require("mongoose")

const Schema = mongoose.Schema


const messageSchema = new Schema({
    title: {type: String , required: true, minlength: 5},
    timestamp: {type: Date , required: true},
    text: {type: String, required: true , minlength: 1},
    user: {type: Schema.Types.ObjectId , ref: "User"}
})

messageSchema.virtual('url').get(function(){
    return `message/${this._id}`
})

module.exports = mongoose.model("Message" , messageSchema)