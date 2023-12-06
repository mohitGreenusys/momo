const joi = require('joi');

const registerValidation = joi.object({
    name: joi.string().max(20).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    phoneNumber: joi.number().min(1000000000).required()
});

const adminValidation = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
});

const loginValidation = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
});

const slotValidation = joi.object({
    timeRanges: joi.string().required(),
    slotPrice: joi.number().required(),
    numberOfSlots: joi.number().required(),
    date: joi.string().required()
});

const bookingValidation = joi.object({
    slotId: joi.string().required(),
    paymentReferenceNumber: joi.string().required()
});

module.exports = {
    registerValidation,
    loginValidation,
    slotValidation,
    bookingValidation,
    adminValidation
}
