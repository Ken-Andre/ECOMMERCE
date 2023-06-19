const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../config/refreshtoken');
const jwt = require('jsonwebtoken');
//const sendEmail = require('./emailCtrl');
const crypto = require('crypto');
const sendEmail = require('./emailCtrl');

//Create a User
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        //Creates a new User
        const newUser = await User.create(req.body);
        res.json(newUser);
    }
    else {
        // User already exists
        res.sendStatus(409);
        throw new Error('User Already Exists');
    }

});

//Login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // Checks if all parameters are filled
    if (!email || !password){
        res.status(400).json({"message":"The email or password path fields is empty"});
    }
    console.log(email, password);
    // check if user exists or not
    const findUser = await User.findOne({ email });
    if (findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updatedUser = await User.findByIdAndUpdate(
            findUser.id,
            { refreshToken: refreshToken, },
            { new: true }
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            maxAge: 72  * 60 * 60 *1000,
        });
        //passwords is correct
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
            role: findUser?.role
        });
    } else {
        res.status(401).json({"message":"Invalid Credentials"});
        // throw new Error("Invalid Credentials !");
    }
});


// startup login

const loginStartup = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findStartup = await User.findOne({ email });
  if (findStartup.role !== "startup") throw new Error("Not Authorised");
  if (findStartup && (await findStartup.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findStartup?._id);
    const updateuser = await User.findByIdAndUpdate(
      findStartup.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 32 * 60 * 60 * 1000,
    });
    res.json({
      _id: findStartup?._id,
      firstname: findStartup?.firstname,
      lastname: findStartup?.lastname,
      email: findStartup?.email,
      mobile: findStartup?.mobile,
      token: generateToken(findStartup?._id),
    });
  } else {
    res.status(401).json({"message":"Forbidden !"});
        // throw new Error("Invalid Credentials !");
  }
});


// admin login

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateuser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 48 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    res.status(401).json({"message":"Forbidden !"});
        // throw new Error("Invalid Credentials !");
  }
});


// Get all Users
const getallUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    } catch (error) {
        throw new Error(error);
    }
});

//Get a single User
const getaUser = asyncHandler(async (req, res) => {
    //console.log(req.params);
    const { id } = req.params;
    validateMongoDbId(id);
    //console.log(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        })
    } catch (error) {
        throw new Error(error);

    }
});

//Save a user address
const saveAddress = asyncHandler(async (req, res, next) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          address: req?.body?.address,
        },
        {
          new: true,
        }
      );
      res.json(updatedUser);
    } catch (error) {
      throw new Error(error);
    }
  });

//Delete a single User
const deleteaUser = asyncHandler(async (req, res) => {
    console.log(req.params);
    const { id } = req.params;
    console.log(id);
    try {
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        })
    } catch (error) {
        throw new Error(error);

    }
});

// Block the user
const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            },
        );
        res.json(

            {
                message: "User Blocked",
            }
        )
    } catch (error) {
        throw new Error(error);
    }
});

// Unblock user
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const unblock = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true,
            },
        );
        res.json(
            {
                message: "User Unblocked",
            }
        )
    } catch (error) {
        throw new Error(error);
    }
});


//Handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) =>{
    const cookie = req.cookies;
    console.log(cookie);
    if(!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    //console.log(refreshToken);
    const user = await User.findOne({refreshToken});
    if(!user) throw new Error("No Refresh Token in db or not matched")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err,decoded) => {
        if(err || user.id !== decoded.id) {
            throw new Error ('There is something went wrong with refresh token');
        }
        const accessToken = generateToken(user?._id);
        res.json( {accessToken});
    });
});


//logout functionnality
const logout = asyncHandler(async (req,res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user) {
        res.clearCookie('refreshToken',  refreshToken, {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204); // forbidden
    }
    await User.findOneAndUpdate(refreshToken, {
        refreshToken: "",
    });
    res.clearCookie('refreshToken',  refreshToken, {
        httpOnly: true,
        secure: true,
    });
    return res.sendStatus(204); // forbidden

});

//Update a User
const updatedUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    console.log(req.user);
    try {
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                firstname: req?.body?.firstname,
                lastname: req?.body?.lastname,
                email: req?.body?.email,
                mobile: req?.body?.mobile,
            },
            {
                new: true,
            }
        );
        res.json(updatedUser)

    } catch (error) {
        throw new Error(error);

    }
})

//Change a password
const updatePassword = asyncHandler(async (req, res) => {
    //console.log(req.body);
    const{ _id } = req.user;
    const {password} = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
});

const forgotPasswordToken = asyncHandler(async (req,res) => {
    const {email} = req.body;
    const user = await User.findOne( {email} );
    if(!user) throw new Error("User not found with this email");
    try {
        const token =  await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, Please follow the link to reset your password. This link will be valid for only 10 minutes now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click here</a>`;
        const data = {
            to: email,
            text: "Hey Patriots - Dev Kyan !",
            subject: "Forgot Password Link",
            htm: resetURL,
        };
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
});

const resetPassword  =  asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if(!user) throw new Error("Token Expired, Please try again");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
})

module.exports = {
    createUser,
    loginUserCtrl,
    loginStartup,
    loginAdmin,
    saveAddress,
    getallUser,
    getaUser,
    deleteaUser,
    updatedUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
};


