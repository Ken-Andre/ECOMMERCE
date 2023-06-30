const express = require("express");
const {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  unblockUser,
  blockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginStartup,
  loginAdmin,
  updatedUser,
  saveAddress,
  userCart,
  emptyCart,
  createOrder,
  getOrders,
  getUserCart,
  updateOrderStatus,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();
router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put("/password", authMiddleware, updatePassword);
router.put("/update-order/:id", authMiddleware,isAdmin, updateOrderStatus)
router.post("/login", loginUserCtrl);
router.post("/smooth-login", loginStartup); //before wood login.
router.post("/admin-login", loginAdmin);
router.post("/cart", authMiddleware, userCart);
router.post("/cart/cash-order", authMiddleware, createOrder);

router.get("/cart", authMiddleware, getUserCart);
router.get("/get-orders", authMiddleware, getOrders);
router.get("/all-users", getallUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/:id", authMiddleware, isAdmin, getaUser);

router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:id", deleteaUser); // J'ai failli oublier une fois le .delete ca m'a coute cher !

router.put("/edit-user", authMiddleware, updatedUser);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser); //);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);

module.exports = router;
