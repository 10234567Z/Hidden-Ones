const mongoose = require("mongoose")

const Schema = mongoose.Schema

const UserSchema = new Schema({
    firstName: {type: String , required: true , minlength: 5 },
    lastName: {type: String , required: true , minlength: 5 },
    userName: {type: String , required: true , minlength: 1 },
    isMember: {type: Boolean , required: true},
    isAdmin: {type: Boolean , required: true},
})

UserSchema.virtual("url").get(function(){
    return `user/${this._id}`
})

module.exports = mongoose.model("User" , UserSchema)