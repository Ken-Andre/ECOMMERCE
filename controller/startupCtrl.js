const Startup = require("../models/startupModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");
const  {cloudinary}  = require("../utils/cloudinary");
const fs = require("fs");
// Create startup function here
const createStartup = asyncHandler(async (req, res) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const newStartup = await Startup.create(req.body);
    res.json(newStartup);
  } catch (error) {
    throw new Error(error);
  }
});

// Get a startup function
const getaStartup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const findStartup = await Startup.findById(id);
    res.json(findStartup);
  } catch (error) {
    throw new Error(error);
  }
});

//Update a startup
const updateStartup = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const updateStartup = await Startup.findOneAndUpdate(
      { _id: id },
      req.body,
      {
        new: true,
      }
    );
    res.json(updateStartup);
  } catch (error) {
    throw new Error(error);
  }
});

//Delete a startup
const deleteStartup = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const deleteStartup = await Startup.findOneAndDelete(
      { _id: id },
      req.body,
      {
        new: true,
      }
    );
    res.json(updateStartup);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllStartup = asyncHandler(async (req, res) => {
  //console.log(req.query);
  try {
    // Filtering startups
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    //console.log(queryObj, req.query);
    let queryStr = JSON.stringify(queryObj);
    //Option de tri
    // gte:greater than equal(>=)
    // lte:less than equal(<=)
    // gt:greater than (>)
    // lt:less than (<)
    queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);
    //console.log(JSON.parse(queryStr));

    let query = Startup.find(JSON.parse(queryStr));

    //Sorting startups at  defaut by createdAt(old)
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("createdAt");
    }

    //limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    console.log(page, limit, skip);
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const startupCount = await Startup.countDocuments();
      if (skip >= startupCount) throw new Error("This page doesn't exists.");
    }
    const startup = await query;
    res.json(startup);
  } catch (error) {
    throw new Error(error);
  }
});

// Block the user
const blockStartup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const block = await Startup.findByIdAndUpdate(
      id,
      {
        isVerified: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "Startup Blocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Unblock user
// Preuve d'identité
// Preuve d'identité d'un utilisateur associé à ce compte

// Informations de contact

// Compte Google My Business vérifié et synchronisé

// Propriété du nom de domaine enregistré

// Nom de domaine vérifié dans la base de données d'un tiers

// Compte bancaire

// Compte bancaire enregistré lors de la procédure d'abonnement
const unblockStartup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unblock = await Startup.findByIdAndUpdate(
      id,
      {
        isVerified: true,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "Startup Unblocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// prodId ici designe l'id de la startup en question a la place de startupId
// En params on entrera a cette url: "{{base_url}}startup/rating", {"star":0,"prodId":"123456","comment":"your comment"}
const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const {  star, prodId, comment } = req.body;
  try {
    const startup = await Startup.findById(prodId);
    if (startup.ratings.some((rating) => !rating.postedBy)) {
      // handle the case where one of the elements in the startup.ratings array doesn't have a postedBy property
      console.log("Something here  rating haven't the postedBy");
    }

    let alreadyRated = startup.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Startup.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
      // res.json(updateRating);
    } else {
      const rateStartup = await Startup.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getallratings = await Startup.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let finalproduct = await Startup.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      { new: true }
    );
    res.json(finalproduct);
  } catch (error) {
    throw new Error(error);
  }
});


// Middleware de téléchargement d'image sur Cloudinary
const uploadImages = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('Veuillez sélectionner une image à télécharger.');
    }

    // Télécharger l'image sur Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(req.file.path);

    // Mettre à jour le modèle de démarrage avec les informations d'image téléchargées
    const startup = await Startup.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          images: {
            public_id: uploadedImage.public_id,
            url: uploadedImage.secure_url,
          },
        },
      },
      { new: true }
    );

    // Supprimer l'image téléchargée localement
    fs.unlinkSync(req.file.path);

    res.json(startup);
  } catch (error) {
    next(error);
  }
};

const removeFalseImageIds = asyncHandler(async (req, res) => {
    try {
    const startups = await Startup.find({});
    await Promise.all(startups.map(async (startup) => {
      startup.images = startup.images.map((image) => {
        return { ...image, public_id: undefined };
      });
      await startup.save();
    }));
    console.log("Removed false image IDs from all startups.");
    return res.json({ success: true, message: "Removed false image IDs from all startups." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to remove false image IDs from all startups." });
  }
});

module.exports = {
  createStartup,
  getaStartup,
  updateStartup,
  getAllStartup,
  deleteStartup,
  blockStartup,
  unblockStartup,
  rating,
  uploadImages,
  removeFalseImageIds,
};
