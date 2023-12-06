const mongoose = require('mongoose');

const SlotSchema = mongoose.Schema({
    slotNumber:{
        type: Number,
        required: true
    },
    timeRanges:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    slotPrice:{
        type: Number,
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    paymentReferenceNumber:{
        type: String,
    },
    paymentBy:{
        type: String,
    },
    status:{
        type: String,
        default: 'available',
        enum : ['available','booked','pending']
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Slot', SlotSchema);