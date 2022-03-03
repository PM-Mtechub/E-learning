const PlatLists = require('../models/PlayListSchema')
const Users = require('../models/UserSchema')
const mongoose = require("mongoose")
var cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name: process.env.cloudName,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
});
const fs = require('fs');
const path = require("path")


// add New PlayList
const addNewPlayList = async (req, res) => {
    const { title , price , desc  } = req.body;
    const {SliderImg1 , SliderImg2 , SliderImg3 } = req.files
    
 
    if(!SliderImg1 && !SliderImg2 && !SliderImg3){
        return res.json({
            success: false,
            message: "Please fill All required credentials"
        });
    }

    if (!title && !price && !desc ) {
        return res.json({
            success: false,
            message: "Please fill All required credentials"
        });
    } else {
        if ((req.files.SliderImg1[0].mimetype  !== "image/jpeg" && req.files.SliderImg1[0].mimetype  !== "image/jpg" && req.files.SliderImg1[0].mimetype  !== "image/webP" && req.files.SliderImg1[0].mimetype  !== "image/png")) {
        return res.json({
            success: false,
            message: "First Image of Sliders Not Found"
        });
    }
    if ((req.files.SliderImg2[0].mimetype !== "image/jpeg" && req.files.SliderImg2[0].mimetype !== "image/jpg" && req.files.SliderImg2[0].mimetype !== "image/webP" && req.files.SliderImg2[0].mimetype !== "image/png")) {
        return res.json({
            success: false,
            message: "Second Image of Slider Not Found"
        });
    }
    if ((req.files.SliderImg3[0].mimetype !== "image/jpeg" && req.files.SliderImg3[0].mimetype !== "image/jpg" && req.files.SliderImg3[0].mimetype !== "image/webP" && req.files.SliderImg3[0].mimetype !== "image/png")) {
        return res.json({
            success: false,
            message: "Third Image of Slider Not Found"
        });
    }
        const check = await PlatLists.find({
            title: title
        })
        if (check.length > 0) {
            return res.json({
                success: false,
                message: 'PlayList Title Already Exists '
            })
        } else {
                let myFileSize = {}
                // pushing play list slider images
                req.body.images = [];
                if (req.files.SliderImg1) {
                    // await cloudinary.uploader.upload(req.files.SliderImg1.tempFilePath, (err, res) => {
                    //     req.body.images.push(res.url);
                    // })
                    myFileSize = checkImageSize(`./playListImages/${req.files.SliderImg1[0].filename}`)
                    if (myFileSize.success === false) {
                        return res.json({
                            success: false,
                            message: myFileSize.message
                        });
                    }
                    var lower = req.files.SliderImg1[0].filename.toLowerCase();
                    req.body.images.push(lower)
                    console.log("lower : ", lower)
                    myFileSize = {}
                }
                if (req.files.SliderImg2) {
                    // await cloudinary.uploader.upload(req.files.SliderImg2.tempFilePath, (err, res) => {
                    //     req.body.images.push(res.url);
                    // })
                    myFileSize = checkImageSize(`./playListImages/${req.files.SliderImg2[0].filename}`)
                    if (myFileSize.success === false) {
                        return res.json({
                            success: false,
                            message: myFileSize.message
                        });
                    }
                   var lower = req.files.SliderImg2[0].filename.toLowerCase();
                    req.body.images.push(lower)
                    //req.body.images.push(req.files.SliderImg2[0].filename)
                    myFileSize = {}
                }
                if (req.files.SliderImg3) {
                    // await cloudinary.uploader.upload(req.files.SliderImg3.tempFilePath, (err, res) => {
                    //     req.body.images.push(res.url);
                    // })
                    myFileSize = checkImageSize(`./playListImages/${req.files.SliderImg3[0].filename}`)
                    if (myFileSize.success === false) {
                        return res.json({
                            success: false,
                            message: myFileSize.message
                        });
                    }
                    var lower = req.files.SliderImg3[0].filename.toLowerCase();
                    req.body.images.push(lower)
                    //req.body.images.push(req.files.SliderImg3[0].filename)
                    myFileSize = {}
                }
                const newPlayList = new PlatLists({...req.body})
                try {
                    await newPlayList.save();

                    res.json({
                        success: true,

                    })
                } catch (error) {
                    console.log("Error in addNewPlayList and error is : ", error)
                    res.status(201).json({
                        succes: false,
                        error
                    })
                }
        }
    }
}

// uodate Play list
const updatePlayList = async (req, res) => {
    const {
        id
    } = req.params

    console.log("Body : ", req.body , "Files : ", req.files)

    if (!id) {
        return res.status(201).json({
            siccess: false,
            message: 'Id is Required for Updation'
        })
    } else {
        let isExist = await PlatLists.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'PlayList Id is Incorrect or Playlist does Not Exists'
            })
        } else {
            let myFileSize = {}
            try {
                // uploading iamges if any
                if (req.files.SliderImg1) {
                    if ((req.files.SliderImg1[0].mimetype !== "image/jpeg" && req.files.SliderImg1[0].mimetype !== "image/jpg" && req.files.SliderImg1[0].mimetype !== "image/webP" && req.files.SliderImg1[0].mimetype !== "image/png")) {
                        return res.json({
                            success: false,
                            message: "First Image of Sliders is not of Image Type"
                        });
                    }
                    myFileSize = checkImageSize(`./playListImages/${req.files.SliderImg1[0].filename}`)
                    if (myFileSize.success === false){
                        return res.json({
                            success: false,
                            message: myFileSize.message
                        });
                    }
                    var lower = req.files.SliderImg1[0].filename.toLowerCase();
                    isExist.images[0] = lower;
                    myFileSize = {}
                }
                if (req.files.SliderImg2) {
                    if ((req.files.SliderImg2[0].mimetype !== "image/jpeg" && req.files.SliderImg2[0].mimetype !== "image/jpg" && req.files.SliderImg2[0].mimetype !== "image/webP" && req.files.SliderImg2[0].mimetype !== "image/png")) {
                        return res.json({
                            success: false,
                            message: "Second Image of Slider is not of Image Type"
                        });
                    }
                    myFileSize = checkImageSize(`./playListImages/${req.files.SliderImg2[0].filename}`)
                    if (myFileSize.success === false) {
                        return res.json({
                            success: false,
                            message: myFileSize.message
                        });
                    }
                    var lower = req.files.SliderImg2[0].filename.toLowerCase();
                    isExist.images[1] = lower;
                    myFileSize = {}
                }
                if (req.files.SliderImg3) {
                    if ((req.files.SliderImg3[0].mimetype !== "image/jpeg" && req.files.SliderImg3[0].mimetype !== "image/jpg" && req.files.SliderImg3[0].mimetype !== "image/webP" && req.files.SliderImg3[0].mimetype !== "image/png")) {
                        return res.json({
                            success: false,
                            message: "Third Image of Slider is not of Image Type"
                        });
                    }
                    myFileSize = checkImageSize(`./playListImages/${req.files.SliderImg3[0].filename}`)
                    if (myFileSize.success === false) {
                        return res.json({
                            success: false,
                            message: myFileSize.message
                        });
                    }
                    var lower = req.files.SliderImg3[0].filename.toLowerCase();
                    isExist.images[2] = lower;
                    console.log("called : ", isExist.images[2])
                    myFileSize = {}
                }
                
                if(req.body.title || req.body.desc || req.body.price){
                    isExist.title = req.body.title
                    isExist.desc = req.body.desc
                    isExist.price = req.body.price
                }

                await PlatLists.findByIdAndUpdate(id, {
                        $set: isExist 
                    }, {
                        new: true
                    })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updatePlayList and error is : ", error)
                return res.status(201).json({
                    success: false,
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// delete PlayList
const deletePlayList = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const gotPlayList = await PlatLists.findById(id);
        if (!gotPlayList){
            return res.status(201).json({success: false, message: "No PlayList Found" })
        }else{
            // checking if playlist has any videos
            if (gotPlayList.videos.length > 0){
                 return res.json({
                     success: false,
                     message: 'You Can Not Delete this PlayList as it contains some videos. You have to delete that videos First. Thanks',
                 });
            }

            // checking if its subscribed by any user or not
            const isUserContain = await Users.findOne({ puchasedPlayList : {$elemMatch : { id : id }} });
            if (isUserContain){
                if (isUserContain.length > 0){
                    // if subs ending date is greater than toadays date
                    if (isExists.puchasedPlayList.length > 0) {
                        let gotDate = new Date(isExists.puchasedPlayList[0].endDate)
                        if (gotDate.getUTCDate() >= curntDate.getUTCDate()) {
                            return res.json({
                                success: false,
                                message: 'You Can Not Delete this PlayList as it Subscribed by any User. Please wait for expiring his Subscription. Thanks',
                            });
                        }
                    }
                }
            }
            const deletedPlayList = await PlatLists.findByIdAndDelete(id);

            if (!deletedPlayList) {
                return res.json({
                    success : false,
                    message: 'PlayList Could Not Be deleted',
                });
            } else {
                return res.json({
                    success: true,
                    message: 'PlayList SuccessFully Deleted',
                });
            }
        }
    } catch (error) {
        console.log("Error in deletePlayList and error is : ", error)
        return res.json({
            success: false,
            error,
        });
    }
}

// get all PlayLists
const getAllPlayLists = async (req, res) => {
    try {
        const allPlayLists = await PlatLists.find({} , {videos : 0 , desc : 0 , createdAt : 0 , updatedAt : 0 , __v : 0  , price : 0 })

        if (!allPlayLists) {
            return res.json({
                success: false,
                message: 'No PlayLists Found',
            });
        } else {
            return res.json({
                allPlayLists,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllPlayLists and error is : ", error)
        return res.json({
            error,
            success: false,
        });
    }
}

// get all PlayLists
const getAllPlayListsForAdmin = async (req, res) => {
    try {
        const allPlayLists = await PlatLists.find({} , { updatedAt : 0 , __v : 0})

        if (!allPlayLists) {
            return res.json({
                success: false,
                message: 'No PlayLists Found',
            });
        } else {
            return res.json({
                allPlayLists,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllPlayListsForAdmin and error is : ", error)
        return res.json({
            error,
            success: false,
        });
    }
}

// get all Recent PlayLists
const getRecentPlayLists = async (req, res) => {
    try {
        const allPlayLists = await PlatLists.find({} , {videos : 0 , createdAt : 0 , updatedAt : 0 , __v : 0 }).limit(7);
        if (!allPlayLists) {
            return res.json({
                success: false,
                message: 'No PlayList Found',
            });
        } else {
            return res.json({
                allPlayLists,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getRecentPlayLists and error is : ", error)
        return res.json({
            error,
            success: false,
        });
    }
}

// get Single PlayList
const getSinglePlayList = async (req, res) => {
    const {id , userid} = req.params;
    let duration = "";
    let curntDate = new Date();
    try {
        // checking if playlist is subscribed by user or not
        const isExists = await Users.findById(userid , { puchasedPlayList : { $elemMatch : {id : id}} , _id : 0 } )
        if (isExists !== null){
            // if subs ending date is greater than toadays date
            if (isExists.puchasedPlayList.length > 0){
                let gotDate = new Date(isExists.puchasedPlayList[0].endDate)
                if (gotDate.getUTCDate() >= curntDate.getUTCDate()) {
                    duration = isExists.puchasedPlayList[0].duration
                }
            }
        }
        const gotPlayList = await PlatLists.findById(id ,  { createdAt : 0 , updatedAt : 0 , __v : 0   })
        if (gotPlayList) {
            const singlePlayList = await PlatLists.aggregate([
                {
                    $match: {
                        _id : mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: 'lmsappplayvideos',
                        localField: 'videos',
                        foreignField: '_id',
                        as: 'videos'
                    },
                },
            ]);

            if (!singlePlayList) {
                return res.json({
                    duration,
                    success: false,
                });
            } else {
                return res.json({
                    duration ,
                    singlePlayList,
                    success: true,
                });
            }
        }else{
             return res.json({
                 success: false,
                 message: "PlayList Does Not Exist",
             });
        }
    } catch (error) {
        console.log("Error in getSinglePlayList and error is : ", error)
        return res.json({
            success: false,
            error
        });
    }
}

// get Single PlayList for admin
const getSingleForAdmin = async (req, res) => {
    const {id } = req.params;
    try {
        const ixExistPlaylist = await PlatLists.findById(id);
        if (ixExistPlaylist !== null){

            const singlePlayList = await PlatLists.aggregate([{
                    $match: {
                        _id: mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: 'lmsappplayvideos',
                        localField: 'videos',
                        foreignField: '_id',
                        as: 'videos'
                    },
                },
            ]);

            if (singlePlayList === null) {
                return res.json({
                    success: false,
                    message: 'No PlayList Found',
                });
            } else {
                return res.json({
                    singlePlayList,
                    success: true,
                });
            }
        }else{
            return res.json({
                success: false,
                message: "PlayList Does Not Exist",
            });
        }
    } catch (error) {
        console.log("Error in getSingleForAdmin and error is : ", error)
        return res.json({
            success: false,
            error
        });
    }
}



// get all PlayList Count
const getPlayListsCount = async (req, res) => {
    try {
        const count = await PlatLists.find({}).count();
        if (!count) {
            return res.json({
                success: false,
                message: 'No Playlist Found',
            });
        } else {
            return res.json({
                count,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getPlayListsCount and error is : ", error)
        return res.json({
            success: false,
            error,
        });
    }
}

// checking Slider image  size
const checkImageSize = (file) => {
    const filePath = file;
    var fileInfo = fs.statSync(filePath)
    var fileSizeMB = fileInfo.size / (1024 * 1024);
    if (fileSizeMB > 5 ) { // if filw size is graeter tha 5MB , file will not be uploaded
        return {
            success: false,
            message: `Sorry! But, You can not upload Slider Image of more than 5MB and your file size is ${fileSizeMB}`
        }
    }else{
        return {
            success: true,
            message: "No Issue with Image Size"
        }
    }
}

module.exports = {
    addNewPlayList,
    updatePlayList,
    getAllPlayLists,
    getSinglePlayList,
    getRecentPlayLists,
    deletePlayList,
    getPlayListsCount,
    getSingleForAdmin,
    getAllPlayListsForAdmin
}