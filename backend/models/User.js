const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    fullname : {
        type: String,
    },
    socketId: {
        type: String,
        defualt:''
    },
    room:{
        type: String
    },
    profile:{
        type: String,
    },
    bio: {
        type: String,
    },
    isOnline:{
        type: Boolean,
        defualt:false
    }
},{timestamps:true})

module.exports = mongoose.model('User', userSchema)