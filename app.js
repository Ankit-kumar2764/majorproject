
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const Listing = require("./models/listing")
const path = require("path")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
app.use(express.static(path.join(__dirname, "public"))) 
const wrapAsync = require("./utils/wrapAsync")
const ExpressError = require("./utils/ExpressError")
const {listingSchema} = require("./schema.js")
const review = require("./models/review")




const MONGO_URI = "mongodb://localhost:27017/wonderlust"

Main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

async function Main() {
    await mongoose.connect(MONGO_URI)
    await migrateListingImages()
    }


    app.set("view engine", "ejs")
    app.engine("ejs", ejsMate)
    app.set("views", path.join(__dirname, "views"))
    app.use(express.urlencoded({ extended: true }))
    app.use(methodOverride("_method"))

    const defaultImageUrl = "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"

    function getListingDisplayImageUrl(listing) {
        return listing.image?.url || listing.Image || defaultImageUrl
    }

    function normalizeListingImage(body) {
        const imageUrl = body.image || body.Image || defaultImageUrl
        return {
            ...body,
            image: {
                filename: "listingimage",
                url: imageUrl,
            },
        }
    }

    function ensureValidListingId(req, res, next) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next("route")
        }
        next()
    }

    async function migrateListingImages() {
        await Listing.deleteMany({
            $and: [
                {
                    $or: [
                        { image: { $exists: false } },
                        { "image.url": { $exists: false } },
                        { "image.url": null },
                        { "image.url": "" },
                    ],
                },
                {
                    $or: [
                        { Image: { $exists: false } },
                        { Image: null },
                        { Image: "" },
                    ],
                },
            ],
        })
    }

app.get("/", (req, res) => {
    res.send("Hi i am root")
})

//create route
app.post("/listings", wrapAsync(async (req, res) => { 
   let result = listingSchema.validate(req.body);
   console.log(result);
    
        const newListing = new Listing(normalizeListingImage(req.body));
        await newListing.save();
        res.redirect("/listings");
}));


//review route
app.post("/listings/:id/reviews", ensureValidListingId, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    const newReview = new review(req.body);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${id}`);
}));

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
app.get("/listings",wrapAsync( async (req, res) => {
    try {
        const rawData = await Listing.find({});  // MongoDB se data
        const data = rawData.map((listing) => ({
            ...listing.toObject(),
            displayImageUrl: getListingDisplayImageUrl(listing),
        }))
        res.render("listings/index", { data });                    // client ko bhejna
    } catch (err) {
        console.log(err);
        res.status(500).send("Error occurred");
    }
}));


//new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});


// show route
app.get("/listings/:id", ensureValidListingId, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", {
        listing: {
            ...listing.toObject(),
            displayImageUrl: getListingDisplayImageUrl(listing),
        },
    });
}));

// edit route
app.get("/listings/:id/edit", ensureValidListingId, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", {
        listing: {
            ...listing.toObject(),
            displayImageUrl: getListingDisplayImageUrl(listing),
        },
    });
}));

// update route
app.put("/listings/:id", ensureValidListingId, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, normalizeListingImage(req.body));
    res.redirect(`/listings/${id}`);
}));

// delete route
app.delete("/listings/:id", ensureValidListingId, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));
app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong" } = err;
    res.status(statusCode).send(message);
});
    


app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`);
});