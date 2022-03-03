const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    otpCode: {
        type: Number,
        default: null
    },
    codeSentTime: {
        type: Date,
        default: null
    },
    doB: {
        type: Date,
        default: null
    },
    address: {
        type: String,
        default: ''
    },
    profilePic: {
        type: String,
        default : ''
    },
    puchasedPlayList: [{
        _id: false,
        id : {
            type: mongoose.Types.ObjectId,
            ref: 'lmsapptopics',
        },
        duration: {
            type : String,
            enum : ['Daily', "Monthly" , "Quarterly" , "Yearly"]
        },
        endDate: {
            type : Date
        }
    }],
    orders: [{
        _id : false,
        orderId : {
            type: Number
        },
        total : {
            type : Number
        }
    }],
}, {
    timestamps: true
});


const LmsAppUsers = mongoose.model('LmsAppUsers', UserSchema);

module.exports = LmsAppUsers