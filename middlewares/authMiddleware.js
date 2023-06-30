const User = require("../models/userModel");
const Startup = require("../models/startupModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (error) {
      throw new Error("Not Authorized token expired, Please Login.", error);
    }
  } else {
    throw new Error("There is no token attached to header");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  console.log(req.user);
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (adminUser.role !== "admin") {
    throw new Error("You are not an admin !");
  } else {
    console.log("Admin user welcome");
    next();
  }
});

const isAuthStartOrAdmin = asyncHandler(async (req, res, next) => {
  console.log(req.user);
  const { email } = req.user;
  const adminUser = await User.findOne({ email });

  if (adminUser.role === "startup" || adminUser.role === "admin") {
    console.log("Startup and admin welcome");
    if (adminUser.role === "startup") {
      const adminStartup = await Startup.findById(req.params.id);
      if (!adminStartup || adminUser.email !== adminStartup.email) {
        throw new Error("This is not your account");
      }
    }
    next();
  } else {
    res.status(401);
    throw new Error(
      "You are not authorized to perform this action on this account."
    );
  }
});

//export module
module.exports = { authMiddleware, isAdmin, isAuthStartOrAdmin };
