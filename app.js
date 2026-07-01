
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const Listing = require("./models/listing")
const path = require("path")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
app.use(express.static(path.join(__dirname, "public"))) 




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

    const fallbackImageUrls = [
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2t5JTIwdmFjYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    ]

    function getFallbackImageUrl(seedText = "") {
        let hash = 0
        const value = String(seedText || "listing")
        for (let index = 0; index < value.length; index += 1) {
            hash = (hash * 31 + value.charCodeAt(index)) >>> 0
        }
        return fallbackImageUrls[hash % fallbackImageUrls.length]
    }

    function getListingDisplayImageUrl(listing) {
        return getFallbackImageUrl(listing.title || listing.location || listing._id)
    }

    function normalizeListingImage(body) {
        const imageUrl = body.image || body.Image || getFallbackImageUrl(body.title || body.location || body.description || defaultImageUrl)
        return {
            ...body,
            image: {
                filename: "listingimage",
                url: imageUrl,
            },
        }
    }

    async function migrateListingImages() {
        const listings = await Listing.find({})
        await Promise.all(
            listings.map(async (listing) => {
                const currentImageUrl = listing.image?.url || listing.Image
                if (!currentImageUrl || currentImageUrl === defaultImageUrl) {
                    listing.image = {
                        filename: "listingimage",
                        url: getFallbackImageUrl(listing.title || listing.location || listing._id),
                    }
                    delete listing.Image
                    await listing.save()
                }
            })
        )
    }

app.get("/", (req, res) => {
    res.send("Hi i am root")
})

//create route
app.post("/listings", async (req, res) => { 
    const newListing = new Listing(normalizeListingImage(req.body));
    await newListing.save();
    res.redirect("/listings");
});


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
        const rawData = await Listing.find({});  // MongoDB se data
        const data = rawData
            .filter((listing) => listing.image?.url || listing.Image)
            .map((listing) => ({
            ...listing.toObject(),
            displayImageUrl: getListingDisplayImageUrl(listing),
        }))
        res.render("listings/index", { data });                    // client ko bhejna
    } catch (err) {
        console.log(err);
        res.status(500).send("Error occurred");
    }
});


//new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});


// show route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", {
        listing: {
            ...listing.toObject(),
            displayImageUrl: getListingDisplayImageUrl(listing),
        },
    });
});

// edit route
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", {
        listing: {
            ...listing.toObject(),
            displayImageUrl: getListingDisplayImageUrl(listing),
        },
    });
});

// update route
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, normalizeListingImage(req.body));
    res.redirect(`/listings/${id}`);
});

// delete route
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});
    

app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`);
});