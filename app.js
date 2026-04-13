
const express = require("express")
const app = express()
const mongoose = require("mongoose")

const MONGO_URI = "mongodb://localhost:27017/wonderlust"

Main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

async function Main() {
    await mongoose.connect(MONGO_URI)
    }

app.get("/", (req, res) => {
    res.send("Hi i am root")
})

app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`);
});