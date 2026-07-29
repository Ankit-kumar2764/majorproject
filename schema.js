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




module.exports.reviewsSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().min(10).required()
    }).required()
});
