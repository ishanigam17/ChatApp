const asyncHandler = require("express-async-handler")
const User = require("../models/userModels")
const generateToken = require("../config/generateToken")

const registerUser = async(req,res)=>{
  console.log(req.body);
  const {name,email,password,pic} = req.body;
  console.log("user created")
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the Feilds Brother");
    }
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }
    const user = await User.create({
        name,
        email,
        password,
        pic,
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          pic: user.pic,
          token: generateToken(user._id),
       
        });
      } else {
        res.status(400);
        throw new Error("Failed to create a user");
      }

};

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("request aai");
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});



const allUsers = asyncHandler(async (req, res) => {
  console.log(req.query.search)
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});


module.exports = {registerUser , authUser ,allUsers};
