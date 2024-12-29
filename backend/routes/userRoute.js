const express = require('express');
const {registerUser , authUser ,allUsers } = require('../controllers/userController.js');

const router = express.Router();
const {protect} = require("../middleware/authMiddleware")

router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);




 module.exports = router;

