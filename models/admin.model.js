const mongoose  = require('mongoose');

const AdminSchema = mongoose.Schema({
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
    upiId:{
        type: String,
        // required:true
    },
    qrCode:{
        type: String,
        // required:true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Admin', AdminSchema);