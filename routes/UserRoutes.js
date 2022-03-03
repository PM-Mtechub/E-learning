const express = require('express');
const router = express.Router();
const {
    addNewUser,
    LogInUser,
    sendMail,
    checkOtpCode,
    updateUserPass,
    updateUser,
    makeStripePayment,
    getAllUsersCount,
    getSingleUser,
    getAllUsers,
    getRecentUsers,
    getSubPlayLists,
    getUsersOrders,
    getSingleUserAmdin,
    deleteUser
} = require('../controllers/UserController')
const multer = require("multer")
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './userProfPics/')
        //cb(null, '../products')
    },
    filename: function (req, file, cb) {
        cb(null, 'image-' + Date.now() + file.originalname)
    }
})
const upload = multer({
    storage: storage,
});


// Sign Up User
router.post('/api/user/register', addNewUser)

// Sign In User
router.post('/api/user/signin', LogInUser)

// Sending Email
router.put('/api/user/sendMail/:email', sendMail);

// Checking Otp
router.put('/api/user/checkOtp/:email', checkOtpCode);

// Updating password
router.put('/api/user/updatePass/:email', updateUserPass);

// Update user info
router.put('/api/user/updateUserInfo/:id', upload.single("profilePic"), updateUser);

// make stripe payment
router.post('/api/user/makeStipePay', makeStripePayment)

// get single user user for admin
router.get('/api/user/getSingeluserAdmin/:id', getSingleUserAmdin)

// get all users PlayLists
router.get('/api/user/getAllPlatList/:id', getSubPlayLists)

// get all users orders only
router.get('/api/user/getOrdersOnly/:id', getUsersOrders)
 
// get all users
router.get('/api/user/getAll', getAllUsers)

// get all users recent
router.get('/api/user/getRecentUsers', getRecentUsers)

// get all users Count
router.get('/api/user/getAll/count', getAllUsersCount)

// get single users
router.get('/api/user/getSingle/:id', getSingleUser)

// deleting user
router.delete('/api/user/deleteUser/:id', deleteUser);


module.exports = router;