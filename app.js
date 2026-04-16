
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const Listing = require("./models/listing")
const path = require("path")




const MONGO_URI = "mongodb://localhost:27017/wonderlust"

Main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

async function Main() {
    await mongoose.connect(MONGO_URI)
    }


    app.set("view engine", "ejs")
    app.set("views", path.join(__dirname, "views"))
    app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.send("Hi i am root")
})

/*app.get("/listing", async (req, res) => {
    let samplelistings =new Listing({
        title: "Beautiful Beach House",
        description: "A stunning beach house with ocean views and modern amenities.",
        price: 500,
        location: "noida",
        Country: "india",
    });
    await samplelistings.save();
    res.send("Listing created successfully");
    console.log("Sample listing was saved successfully");
});
*/



//index route
app.get("/listings", async (req, res) => {
    try {
        const data = await Listing.find({});  // MongoDB se data
        res.render("listings/index", { data });                    // client ko bhejna
    } catch (err) {
        console.log(err);
        res.status(500).send("Error occurred");
    }
});

// show route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", { listing });
});
    

app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`);
});