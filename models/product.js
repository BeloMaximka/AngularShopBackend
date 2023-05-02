const { Schema, model } = require('mongoose');

const minDate = new Date();
minDate.setDate(minDate.getDate() - 2);

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        validate: /[\w\s]+/
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
});

const productModel = model('product', productSchema);

module.exports = productModel;