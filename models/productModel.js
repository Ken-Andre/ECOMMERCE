const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
        //enum: ["Agroalimentaire","Artisanat","Animaux","Magasin & Jardin","Medias","Beaute et Bien-etre","Construction et fabrication","Shopping & Mode","Sante","Sport"],
        //ref: "Category",
    },
    brand: {
        type: String,
        required: true,
        //enum: ["Apple", "Samsung", "Lenovo"],
    },
    quantity: {
        type: Number,
        required: true,
        //select: false,
    },
    sold: {
        type: Number,
        default: 0,
        //select: false,
    },
    images: [
        {
          public_id: String,
          url: String,
        },
      ],
    color: {
        type: String,
        required: true,
        //enum: ["Black", "White", "Red"],
    },
    ratings: [
        {
            star: Number,
            postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        }
    ],
},
    { timestamps: true }
);

//Export the model
module.exports = mongoose.model('Product', productSchema);
