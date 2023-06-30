const express = require("express");
const {
  createStartup,
  getaStartup,
  getAllStartup,
  updateStartup,
  deleteStartup,
  blockStartup,
  unblockStartup,
  rating,
  uploadImages,
  removeFalseImageIds,
} = require("../controller/startupCtrl");

const {
  isAuthStartOrAdmin,
  isAdmin,
  authMiddleware,
} = require("../middlewares/authMiddleware");
const {
  upload,
  uploadPhoto,
  //productImgResize,
} = require("../middlewares/uploadImages");
const router = express.Router();

router.post("/", createStartup);
/*router.put(
  "/upload/:id",
  authMiddleware,
  uploadPhoto.array("images", 2),
  productImgResize,
  uploadImages,
);*/
// Route pour mettre à jour l'image d'une startup existante
router.put('/upload/:id', upload.single('image'), uploadPhoto);
router.get("/:id", getaStartup);

router.get('/removeFalseImageIds',authMiddleware,removeFalseImageIds);
router.put("/rating", authMiddleware, rating);
router.put("/:id", authMiddleware, isAuthStartOrAdmin, updateStartup);
router.delete("/:id", authMiddleware, isAdmin, deleteStartup);
// router.put('/:id',  authMiddleware, isAdmin, updateProduct);
// router.delete('/:id', authMiddleware, isAdmin, deleteProduct);
router.put("/block-startup/:id", authMiddleware, isAdmin, blockStartup); //);
router.put("/unblock-startup/:id", authMiddleware, isAdmin, unblockStartup); //);
router.get("/", getAllStartup);

module.exports = router;
