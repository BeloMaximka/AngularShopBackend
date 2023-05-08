const express = require('express');
const { default: mongoose } = require("mongoose");
const { replaceWithEqualSymbols, forbiddenWordsPattern } = require("./services/stringService.js");
const cors = require('cors')
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Models
const productModel = require("./models/product.js");
const productCommentModel = require("./models/productComment.js");

const DB_CONNECTION = process.env.DB_CONNECTION;
const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB_CONNECTION);
        console.log('connected');
    } catch (error) {
        console.log(error);
    }
}

connectToDatabase();

app.get("/add-product-test", async (req, res) => {
    const result = await productModel.insertMany({
        name: "Bulka",
        description: "A bulka.",
        image: "https://content.silpo.ua/sku/ecommerce/74/480x480wwm/742144_480x480wwm_041d0957-56f5-165c-a9cd-11692195c862.png",
        price: 20
    });
    const comment = await productCommentModel.insertMany({
        productId: result[0]._id,
        text: 'So great'
    });
    res.send(result + comment);
});

app.get("/get-products", async (req, res) => {
    const includeDescription = req.query.description === "true";
    const includePrice = req.query.price === "true";
    const products = await productModel.find({}).sort({_id: -1})
            .select(`name image ${includeDescription ? 'description' : ''} ${includePrice ? 'price' : ''}`);
    res.send(products);
});

app.get("/get-product", async (req, res) => {
    const id = req.query.id
    if (id === undefined) {
        res.status(400).send("No id prodived");
        return;
    }
    try {
        const product = await productModel.findById(id);
        res.send(product);
    } catch (error) {
        res.status(404).send(`Nothing found by id ${id}.`);
    }
});

app.post("/add-product", async (req, res) => {
    try {
        const { name, image, price, description } = req.body;
        const newProduct = new productModel({ name, image, price, description });
        const result = await newProduct.save();
        res.status(201).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error adding product to database: " + error);
    }
});

app.get("/get-comments", async (req, res) => {
    let id = req.query.id
    if (id === undefined) {
        res.status(400).send("No id prodived");
        return;
    }
    try {
        const comment = await productCommentModel.find({ productId: id }).sort({_id: -1});
        comment.forEach(v => v.text = replaceWithEqualSymbols(v.text, "*", forbiddenWordsPattern));
        res.send(comment);
    } catch (error) {
        res.status(500).send("Error occured: " + error);
    }
});

app.post("/add-comment", async (req, res) => {
    try {
        const { productId, text } = req.body;
        const newComment = new productCommentModel({ productId, text });
        const result = await newComment.save();
        res.status(201).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error adding comment to database: " + error);
    }

});

const PORT = 9312;
app.listen(PORT, () => {
    console.log(`listening at port: ${PORT}`);
});