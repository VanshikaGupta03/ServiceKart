const Joi = require("joi");

const userValidationSchema = Joi.object({
    first_name: Joi.string().min(2).max(255).required(),
    last_name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\d{10}$/).required(),
    gender: Joi.string().valid("male", "female").required(),
    dob: Joi.date().iso().required(),
    profile_image: Joi.string().allow(null, ""),
});

const addressValidationSchema = Joi.object({
    
    address_type: Joi.string().valid("Home", "Office", "Others").required(),
    house_area: Joi.string().max(255).required(),
    landmark: Joi.string().max(255).required(),
    person_name: Joi.string().max(255).required(),
    longitude: Joi.number().precision(8).required(),
    latitude: Joi.number().precision(8).required(),
});

const cardValidationSchema = Joi.object({
    
    card_type: Joi.string().valid("credit", "debit").required(),
    card_holder_name: Joi.string().max(255).required(),
    card_number: Joi.string().length(16).pattern(/^[0-9]+$/).required(),
    expiry_date: Joi.date().iso().required(),
});

module.exports = {
    userValidationSchema,
    addressValidationSchema,
    cardValidationSchema,
};
