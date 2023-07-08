const express = require('express');
const { default: mongoose } = require("mongoose");
const { replaceWithEqualSymbols, forbiddenWordsPattern } = require("./services/stringService.js");
const cors = require('cors')
const path = require('path');
require('dotenv').config();
const fs = require('fs')

const app = express();
app.use(cors());
app.use(express.json());

if (!fs.existsSync("./.env")) {
    console.log("ERROR! Missing .env file in root folder. Don't forget to add DB_CONNECTION=\"STRING\" in there.");
    return;
}

// Models
const productModel = require("./models/product.js");
const productCommentModel = require("./models/productComment.js");
const shoppingCartItemModel = require("./models/shoppingCartItem.js");

const DB_CONNECTION = process.env.DB_CONNECTION;
const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB_CONNECTION);
        console.log('connected');
		const PORT = 9312;
		app.listen(PORT, () => {
			console.log(`listening at port: ${PORT}`);
		});
    } catch (error) {
        console.log(error);
    }
}

connectToDatabase();

app.use('/', express.static('dist/shop'));

app.get("/products", async (req, res) => {
    const includeDescription = req.query.description === "true";
    const includePrice = req.query.price === "true";
    const products = await productModel.find({}).sort({ _id: -1 })
        .select(`name image ${includeDescription ? 'description' : ''} ${includePrice ? 'price' : ''}`);
    res.send(products);
});

app.get("/products/:id", async (req, res) => {
    const id = req.params.id
    try {
        const product = await productModel.findById(id);
        res.send(product);
    } catch (error) {
        res.status(404).send(`Nothing found by id ${id}.`);
    }
});

app.post("/products", async (req, res) => {
    try {
        const { name, image, price, description } = req.body;
        const newProduct = new productModel({ name, image, price, description });
        const result = await newProduct.save();
        res.status(201).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error occured while adding product to database: " + error);
    }
});

app.delete("/products/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await productCommentModel.deleteMany({ productId: id });
        const result = await productModel.findOneAndDelete(id);
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error removing product from database: " + error);
    }
});

app.get("/comments/:id", async (req, res) => {
    let id = req.params.id
    if (id === undefined) {
        res.status(400).send("No id prodived");
        return;
    }
    try {
        const comment = await productCommentModel.find({ productId: id }).sort({ _id: -1 });
        comment.forEach(v => v.text = replaceWithEqualSymbols(v.text, "*", forbiddenWordsPattern));
        res.send(comment);
    } catch (error) {
        res.status(500).send("Error occured: " + error);
    }
});

app.post("/comments", async (req, res) => {
    try {
        const { productId, text } = req.body;
        const newComment = new productCommentModel({ productId, text });
        const result = await newComment.save();
        result.text = replaceWithEqualSymbols(result.text, "*", forbiddenWordsPattern);
        res.status(201).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error adding comment to database: " + error);
    }
});

app.get("/shopping-cart-item-exists/:id", async (req, res) => {
    try {
        const stringId = req.params.id;
        if (stringId === undefined) {
            res.status(400).send("No id prodived");
            return;
        }
        let id;
        try {
            id = new mongoose.Types.ObjectId(stringId);
        } catch (error) {
            console.log(error);
            res.status(400).send("Error: " + error);
        }

        const result = await shoppingCartItemModel.exists({ product: id });
        res.status(200).send(result?._id !== undefined);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error: " + error);
    }
});

app.get("/shopping-cart-items", async (req, res) => {
    const cart = await shoppingCartItemModel.find({}).populate('product');
    res.status(200).send(cart);
});

app.post("/shopping-cart-items", async (req, res) => {
    try {
        const { productId, count } = req.body;

        if (await shoppingCartItemModel.exists({ product: productId })) {
            res.status(400).send("Already exists.");
            return
        }

        const newCartItem = new shoppingCartItemModel({ product: productId, count });
        const result = await newCartItem.save();
        result.product = await productModel.findById(productId);
        res.status(201).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error adding shopping cart item to database: " + error);
    }
});

app.delete("/shopping-cart-items/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await shoppingCartItemModel.findOneAndDelete({ product: id });
        res.status(200).send(result._id);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error removing product from shopping cart: " + error);
    }
});

app.delete("/shopping-cart-items", async (req, res) => {
    try {
        const result = await shoppingCartItemModel.deleteMany({});
        res.status(200).send(result.deletedCount > 0);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error updating shopping cart item: " + error);
    }
});

app.put("/shopping-cart-items/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { count } = req.body;
        if (count < 1) {
            res.status(400).send("Count cannot be less than 1");
            return;
        }
        const result = await shoppingCartItemModel.updateMany({ product: id }, { count });
        res.status(200).send(result.modifiedCount > 0);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error updating shopping cart item: " + error);
    }
});