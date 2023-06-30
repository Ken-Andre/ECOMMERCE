const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var startupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      // required: true,
      unique: true,
      lowercase: true,
    },
    website: {
      type: String,
      // required: false,
      unique: true,
    },
    address: {
      type: String,
      required: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      default: "",
    },
    market_value: {
      type: Number,
      // required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Agroalimentaire",
        "Artisanat",
        "Animaux",
        "Magasin & Jardin",
        "Medias",
        "Beaute et Bien-etre",
        "Construction et fabrication",
        "Shopping & Mode",
        "Sante",
        "Sport",
        "Services Technologiques",
        "FinTech",
        "BioTech",
        "HealthTech",
        "CleanTech",
        "AgTech",
        "BioTech",
        "EdTech",
      ],
      //ref: "Category",
    },
    subcategory: {
      type: String,
      required: true,
      //enum: ["Apple", "Samsung", "Lenovo"],
    },
    price: {
      type: Number,
      required: true,
      default:0,
    },
    quantity: {
      type: Number,
      required: true,
      default:0,
      //select: false,
    },
    sell: { //sold
      type: Number,
      default: 0,
      required: true,
      // select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    images: [
  {
    public_id: String,
    url: String,
  },
],
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalratings: {
      type: String,
      default: 0,
    },
    // In fact startup will be allowable to modify this when there are connected and validated by the MIC Groups it will analyse and verify all things be good before uploading something.
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Startup", startupSchema);
