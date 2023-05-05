const { Schema, model } = require('mongoose');

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        validate: /[A-z\s]+/
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true,
        validate: /[\w\s]+/
    },
});

const productModel = model('product', productSchema);

module.exports = productModel;