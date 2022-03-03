const mongoose = require("mongoose");

const PlayListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    images: [{
        type: String,
        required: true,
    }],
    // images : [{
    //     data: Buffer,
    //     contentType: String
    // }],
    price: {
        type: Number,
        required: true,
    },
    desc: {
        type: String,
        default: ''
    },
    videos: [{
        type: mongoose.Types.ObjectId,
        ref: 'lmsappplayvideos',
    }],
}, {
    timestamps: true
});


const LmsAppTopics = mongoose.model('LmsAppTopics', PlayListSchema);

module.exports = LmsAppTopics