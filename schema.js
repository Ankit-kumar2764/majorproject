const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    image: Joi.string().allow(null, ''),
    }).required()
});