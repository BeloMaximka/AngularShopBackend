const { Schema, model, Types } = require('mongoose');

const productCommentSchema = new Schema({
    productId: {
        type: Types.ObjectId,
        required: true,
    },
    text: {
        type: String,
        required: true,
        validate: /\w+/
    },
});

const productCommentModel = model('productComment', productCommentSchema);

module.exports = productCommentModel;