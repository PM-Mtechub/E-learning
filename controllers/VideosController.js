const Videos = require('../models/VideosSchema')
const PlayLists = require('../models/PlayListSchema')
const { getVideoDurationInSeconds } = require('get-video-duration')
const fs = require('fs');
const mongoose = require("mongoose")

// add New Vidoe
const addNewVideo = async (req, res) => {
    const {title , desc , playListId } = req.body;
    //console.log("req.body : ", req.body , "req.file : ", req.file)

    if(!req.file){
        return res.json({
            success: false,
            message: "Please fill All required credentials"
        });
    }

    if ((req.file.mimetype !== "video/mp4")) {
        return res.json({
            success: false,
            message: "No Video File Found"
        });
    }

    if (!title || !desc || !playListId) {
        return res.json({
            success: false,
            message: "Please fill All required credentials"
        });
    } else {
        const check = await Videos.find({
            title: title,
            playListId: playListId
        })
        if (check.length > 0) {
            return res.json({
                success: false ,
                message: 'Video Title Already Exists'
            })
        } else {
            // pushing play list slider images
            let length;
            if (req.file) {
                var lower = req.file.filename.toLowerCase();
                req.body.videoUrl = lower

                // checking file size
                const filePath = `./videos/${req.file.filename}`;
                var fileInfo = fs.statSync(filePath);
                var fileSizeMB = fileInfo.size / (1024 * 1024);
                if (fileSizeMB > 100){ // if filw size is graeter tha 70MB , file will not be uploaded
                    return res.status(201).json({
                        success: false,
                        message:  `Sorry! But, You can not upload video of more than 100MB and your file size is ${fileSizeMB}`
                    })
                }

                // calculation duration of video
                await getVideoDurationInSeconds(`./videos/${req.file.filename}`).then((duration) => {
                    length = secondsToMinutesSec(duration)
                })
            }

            const newPlayList = new Videos({
                length: length,
                ...req.body
            })
            try {
                let addedVideo = await newPlayList.save();

                // putting video into playlist array
                await PlayLists.findByIdAndUpdate(playListId , {$push : {videos : addedVideo._id}} , {new : true})

                res.json({
                    success: true,
                })
            } catch (error) {
                console.log("Error in addNewVideo and error is : ", error)
                res.status(201).json({
                    succes: false,
                    error
                })
            }
        }
    }
}

// uodate Video
const updateVideo = async (req, res) => {
    const {
        id
    } = req.params
    console.log("id : ", id  , "body : ", req.body , " File : ", req.file)
    //return;

    if (!id) {
        return res.json({
            success: false,
            message: 'Id is Required for Updation '
        })
    } else {
        const isExist = await Videos.findById(id)
        if (!isExist) {
            return res.json({
                success: false,
                message: 'Video Id is Incorrect or Video Does Not Exists '
            })
        } else {
            try {
                // pushing play list slider images
                if (req.file) {
                    if ((req.file.mimetype !== "video/mp4")) {
                        return res.json({
                            success: false,
                            message: "No Video File Found"
                        });
                    }

                    // checking file size
                    const filePath = `./videos/${req.file.filename}`;
                    var fileInfo = fs.statSync(filePath);
                    var fileSizeMB = fileInfo.size / (1024 * 1024);
                    if (fileSizeMB > 100){ // if filw size is graeter tha 70MB , file will not be uploaded
                        return res.status(404).json({
                            succes: false,
                            message:  `Sorry! But, You can not upload video of more than 100MB and your file size is ${fileSizeMB}`
                        })
                    }

                    // calculation duration of video
                    await getVideoDurationInSeconds(`./videos/${req.file.filename}`).then((duration) => {
                        length = secondsToMinutesSec(duration)
                    })
                    req.body.videoUrl = "";
                    var lower = req.file.filename.toLowerCase();
                    req.body.videoUrl = lower
                }
                // changing topic of video is required
                console.log("isExist.playListId : ", typeof(isExist.playListId))
                if((isExist.playListId !== req.body.playListId) || (isExist.playListId === "") ){
                    console.log("Paremt changed")
                    let ww = await PlayLists.findByIdAndUpdate(req.body.playListId , {$push : {videos : id}} , {new : true})
                    let qq = await PlayLists.findByIdAndUpdate(isExist.playListId , {$pull : {videos : id}} , {new : true})
                    console.log("res : ", ww , qq)
                }
                const updatedUser = await Videos.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })
                res.json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updateVideo and error is : ", error)
                return res.json({
                    success: false,
                    error
                })
            }
        }
    }
}

// delete Video
const deleteVideo = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const gotVideo = await Videos.findById(id);
        if (!gotVideo) {
            return res.status(201).json({
                success: false,
                message: "No Video Found "
            })
        } else {
            const deletedVideo = await Videos.findByIdAndDelete(id);

            if (!deletedVideo) {
                return res.json({
                    success: false,
                    message: 'Video Not Found ',
                });
            } else {
                const isExistPlayList = await PlayLists.findById(gotVideo.playListId)
                // removing from playlist videos array
                if (isExistPlayList){
                    await PlayLists.findByIdAndUpdate(gotVideo.playListId , {$pull : {videos : id}} , {new : true})
                }
                return res.json({
                    success: true,
                });
            }
        }
    } catch (error) {
        console.log("Error in deleteVideo and error is : ", error)
         return res.json({
             error,
             success: false,
         });
    }
}

// get all Videos of a Playlist
const getAllVideosOfPlayList = async (req, res) => {
    const {playListId} = req.params;
    try {
        const allVideos = await Videos.find({ playListId : playListId} , {createdAt :0 , updatedAt :0 , __v : 0 , playListId : 0})
        if (allVideos === null) {
            return res.json({
                success: false,
                message: 'No Videos Found ',
            });
        } else {
            return res.json({
                allVideos,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllVideosOfPlayList and error is : ", error)
        return res.json({
            error,
            success: false,
        });
    }
}

 // get all Videos fr admin
const getAllVideos = async (req, res) => {
    try {
        const allVideos = await Videos.aggregate([
            {
                $lookup: {
                    from: 'lmsapptopics',
                    localField: 'playListId',
                    foreignField: '_id',
                    as: 'playListId'
                },
            },
        ])
        if (allVideos === null) {
            return res.json({
                success: false,
                message: 'No Videos Found ',
            });
        } else {
            return res.json({
                allVideos,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllVideosOfPlayList and error is : ", error)
        return res.json({
            error,
            success: false,
        });
    }
}


// get Single Video
const getSingleVideo = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const singleVideo = await Videos.findById(id ,{createdAt :0 , updatedAt :0 , __v : 0 , playListId : 0})

        if (singleVideo === null) {
            return res.json({
                success: false,
                message: 'No Video Found ',
            });
        } else {
            return res.json({
                singleVideo,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getSingleVideo and error is : ", error)
        return res.json({
            success: false,
            error
        });
    }
}

// get Single Video
const getSingleVideoAdmin = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const singleVideo = await Videos.aggregate([
            {
                $match :{
                    _id : mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'lmsapptopics',
                    localField: 'playListId',
                    foreignField: '_id',
                    as: 'playListId'
                },
            },
        ])

        if (singleVideo === null) {
            return res.json({
                success: false,
                message: 'No Video Found ',
            });
        } else {
            return res.json({
                singleVideo,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getSingleVideo and error is : ", error)
        return res.json({
            success: false,
            error
        });
    }
}

// get all Videos Count
const getAllVideosCount = async (req, res) => {
    try {
        const count = await Videos.find({}).count();
        if (!count) {
            return res.json({
                success: false,
                message: 'No Vidoeos Found ',
            });
        } else {
            return res.json({
                count,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllVideosCount and error is : ", error)
        return res.json({
            error,
            success: false,
        });
    }
}


// converting sec to minutes
function secondsToMinutesSec(value) {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return  minutes + ':' + seconds; // Return is HH : MM : SS
}




module.exports = {
    addNewVideo,
    updateVideo,
    getAllVideosOfPlayList,
    getSingleVideo,
    deleteVideo,
    getAllVideosCount,
    getAllVideos,
    getSingleVideoAdmin
}