const express = require('express');
const router = express.Router();
const {
    addNewVideo,
    getSingleVideo,
    getAllVideosOfPlayList,
    getAllVideosCount,
    updateVideo,
    deleteVideo,
    getAllVideos,
    getSingleVideoAdmin
} = require('../controllers/VideosController')
const multer = require("multer")
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './videos/')
        //cb(null, '../products')
    },
    filename: function (req, file, cb) {
        cb(null, 'video-' + Date.now() + file.originalname)
    }
})
const upload = multer({
    storage: storage,
});


// add New Video
router.post('/api/video/addNew', upload.single("video") ,  addNewVideo)

// Update  Video
router.put('/api/video/updateSingle/:id', upload.single("video"), updateVideo)

//  Delete Video
router.delete('/api/video/deleteVideo/:id', deleteVideo)

// get all Videos Count
router.get('/api/video/getAllCount', getAllVideosCount)

// get all videos of a playlist
router.get('/api/video/getAllOfPlayList/:playListId', getAllVideosOfPlayList)

// get single Video
router.get('/api/video/getSingle/:id', getSingleVideo)

// get single Video
router.get('/api/video/getSingleAdmin/:id', getSingleVideoAdmin)

// get all Videos for admin
router.get('/api/video/getAll', getAllVideos)


module.exports = router;