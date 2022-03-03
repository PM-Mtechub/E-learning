const express = require('express');
const router = express.Router();
const {
    addNewPlayList,
    getSinglePlayList,
    getAllPlayLists,
    getRecentPlayLists,
    getPlayListsCount,
    getSingleForAdmin,
    updatePlayList,
    deletePlayList,
    getAllPlayListsForAdmin
} = require('../controllers/PlayListController')
const multer = require("multer")
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './playListImages/')
        //cb(null, '../products')
    },
    filename: function (req, file, cb) {
        cb(null, 'sliderimage-' + Date.now() + file.originalname)
    }
})
const upload = multer({
    storage: storage,
});
const cpUpload = upload.fields([{ name: 'SliderImg1' }, { name: 'SliderImg2' } , { name: 'SliderImg3' }])


// add New PlayList
router.post('/api/playList/addNew', cpUpload, addNewPlayList)

// Update playlist by admin
router.put('/api/playList/updatePlaylListSingle/:id', cpUpload, updatePlayList);

// Delete PlayList
router.delete('/api/playList/deletePlayList/:id', deletePlayList)

// get all Play Lists
router.get('/api/playList/getAll', getAllPlayLists)

// get all Playlists Recent
router.get('/api/playList/getAllRecent', getRecentPlayLists)

// get single Playlist
router.get('/api/playList/getSingle/:id/:userid', getSinglePlayList)


// get all Playlists Count
router.get('/api/playList/getAllCount', getPlayListsCount)

// get all Playlist for admin
router.get('/api/playList/getAllForAdmin', getAllPlayListsForAdmin)

// get single Playlist for admin
router.get('/api/playList/getSingleForAdmin/:id', getSingleForAdmin)


module.exports = router;