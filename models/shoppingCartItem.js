const { Schema, model, Types } = require('mongoose');

const shoppingCartItemSchema = new Schema({
    product: {
        type: Types.ObjectId,
        ref: "product",
        required: true
    },
    count: {
        type: Number,
        min: 1,
        required: true
    },
});

const shoppingCartItemModel = model('shoppingCartItem', shoppingCartItemSchema);

module.exports = shoppingCartItemModel;