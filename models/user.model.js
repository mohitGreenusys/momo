const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    },
    phoneNumber:{
        type: Number,
        required:true
    },
    bookings:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot'
    }],
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);