const mongoose = require("mongoose");

const VideosSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    length: {  // duration of video
        type: String,
        default : '00.00'
    },
    desc: {
        type: String,
        default: ''
    },
    videoUrl: {
        type: String,
        default: ''
    },
    playListId: {
        type: mongoose.Types.ObjectId,
        ref: 'lmsapptopics',
    },
}, {
    timestamps: true
});


const LmsAppPlayVideos = mongoose.model('LmsAppPlayVideos', VideosSchema);

module.exports = LmsAppPlayVideos