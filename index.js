const express = require('express');
const { default: mongoose, Schema } = require("mongoose");
const fs = require('fs');
const readline = require('readline');
const events = require('events');
require('dotenv').config();

// Models
const productModel = require("./models/product.js");

const app = express();
const jsonParser = express.json();

const DB_CONNECTION = process.env.DB_CONNECTION;
console.log(DB_CONNECTION);
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
        image: "https://content.silpo.ua/sku/ecommerce/74/480x480wwm/742144_480x480wwm_041d0957-56f5-165c-a9cd-11692195c862.png",
        price: 20
    });
    res.send(result);
});

app.get("/get-products", async (req, res) => {
    const products = await productModel.find({});
    var productsMap = {};
    products?.forEach(function (product) {
        productsMap[product._id] = product;
    });
    res.send(productsMap);
});


const PORT = 9312;
app.listen(PORT, () => {
    console.log(`listening at port: ${PORT}`);
});