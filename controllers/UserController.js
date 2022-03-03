const Users = require('../models/UserSchema')
const PlayLists = require('../models/PlayListSchema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose")
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const nodeMailer = require("nodemailer");
const stripe = require('stripe')(process.env.Stripe_Secret_key)



// Sign Up new User
const addNewUser = async (req, res) => {
    const { fullname, email , password , } = req.body;
    if (!fullname || !email || !password ) {
        return res.json({
            success: false,
            message: "Please fill All required credentials"
        });
    } else {
        const check = await Users.find({
            email: email
        })
        if (check.length > 0) {
            return res.json({
                success: false,
                message: 'User Already Exists'
            })
        } else {
                req.body.password = await bcrypt.hash(password, 10); // hashing password
                const newUser = new Users({...req.body})
                try {
                    await newUser.save();

                    res.status(201).json({
                        succes: true,
                        message: 'User SuccessFully Added'
                    })
                } catch (error) {
                    console.log("Error in addNewUser and error is : ", error)
                    res.status(201).json({
                        success: false,
                        error
                    })
                }
        }
    }
}

// Logging In User
const LogInUser = async (req, res) => {
    const { email ,  password } = req.body

        if(!email  || !password){
            return res.json({success: false , message : "Please fill Required Credientials"})
        }else {
            try {
                const isOprExists = await Users.findOne({email: email}, {otpCode : 0 , codeSentTime : 0 ,puchasedPlayList : 0  , orders : 0  , createdAt :0 , updatedAt : 0 , __v : 0});

                if(!isOprExists){
                    return res.json({success: false ,  message: "User Not Found"})
                }
                    const isPasswordCorrect = await bcrypt.compare(password, isOprExists.password); // comparing password
                    if (!isPasswordCorrect) {
                        return res.json({
                            success: false,
                            message: 'Invalid Credientials'
                        })
                    }

                    const token = jwt.sign({id: isOprExists._id} , JWT_SECRET_KEY , {expiresIn: '24h'}); // gentating token

                    return res.json({
                        myResult: isOprExists,
                        success: true,
                        token
                    });
            } catch (error) {
                console.log("Error in LogInUser and error is : ", error)
                return res.json({
                    success: false,
                    error
                });
            }
        }

}

// sending mails
const sendMail = async(req,res) => {
    const {email} = req.params;
    const data = await Users.find({email: email});
    if(data){
        const curntDateTime = new Date();
        let randomNo = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        await Users.findOneAndUpdate({email : email}, { $set: {...data ,  codeSentTime : curntDateTime , otpCode : randomNo } }, {new: true })

        // step 01
        const transport= nodeMailer.createTransport({
            service : "gmail",
            auth: {
                user : process.env.myEmail, //own eamil
                pass: process.env.myPassword, // own password
            }
        })
        // setp 02
        const mailOption = {
            from: process.env.myEmail, // sender/own eamil
            to: email, // reciver eamil
            subject: "Secret Code For Changing in E-Learning App Password",
            text : `Dear Member , Your Secret Code is ${randomNo}. This will expire in next 60 seconds .`
        }
        // step 03
        transport.sendMail(mailOption, (err, info) => {
            if (err) {
                console.log("Error occured : ", err)
                return res.json({success: false, message : "Error in sending mail" , err})
            } else {
                console.log("Email Sent and info is : ", info.response)
                return res.json({success: true, message: 'Email Sent SuccessFully' })
            }
        })
    }else{
        return res.json({success : false , mesage : "Email Not Found"})
    }
}

// Checking OtpCode
const checkOtpCode = async (req, res) => {
    const {email} = req.params;
    const data = await Users.find({email : email});

    const {otpCode } = req.body;
    if (data.length > 0){
        if(data[0].codeSentTime === null){
            return res.status(201).json({success: false , message: ' You have not requested for Password Changing yet'})
        }
        let curntDateTime = new Date();
        let diff = new Date(curntDateTime.getTime() - data[0].codeSentTime.getTime()) / 1000; //  getting time diff in seconds
        parseInt(diff)
        if (diff < 60) {  // checking if sent time is less than 60 seconds
                try{
                    if(otpCode == data[0].otpCode){
                        const update = await Users.findOneAndUpdate({email: email}  ,{ $set: { ...data.body , codeSentTime : null , otpCode : null }} , {new: true} )

                        if(update){
                            return res.status(201).json({success: true,  message: 'User OtpCode Matched SuccessFully'})
                        }
                    }else{
                        return res.status(504).json({success: false , message: ' InValid Token '})
                    }
                }catch (error) {
                    console.log("Error is :", error)
                    return res.status(501).json({success: false , error ,   message: '!!! Opps An Error Occured !!!' , error})
                }
            }else{
                return res.status(501).json({success: false ,  message: '!!! Time for Your Token Expired !!!' })
            }
        }else{
            return res.status(501).json({success: false ,  message: '!!! InValid Credinatials !!!' })
        }
}

// uodate Member  password only
const updateUserPass = async (req, res) => {
    const {
        email
    } = req.params
    if (!email) {
        return res.status(201).json({
            success : false,
            message: 'Email is Required for Updation'
        })
    } else {
        const isExist = await Users.findOne({
            email: email
        })
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Email is Incorrect'
            })
        } else {
            try {
                if (req.body.password) {
                    req.body.password = await bcrypt.hash(req.body.password, 10); // hashing password
                }

                const updatedUser = await Users.findOneAndUpdate({
                    email: email
                }, {
                    $set: req.body
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })
            } catch (error) {
                console.log("Error in updateUserPass and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    success: false,
                    error
                })
            }
        }
    }
}

// uodate Users Info Only
const updateUser = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation '
        })
    } else {
        const isExist = await Users.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Users Id is Incorrect '
            })
        } else {
            try {
                // uploading user profile picture
                // if (req.files.profilePic) {
                //     await cloudinary.uploader.upload(req.files.profilePic.tempFilePath, (err, res) => {
                //         req.body.profilePic = res.url;
                //     })
                // }
                // uploading user profile iamge to multer
                if (req.file) {
                    var lower = req.file.filename.toLowerCase();
                    req.body.profilePic = lower;
                    console.log("lower : ", lower)
                }
                const updatedUser = await Users.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updateUser and error is : ", error)
                return res.status(504).json({
                    message: '!!! Opps An Error Occured !!!',
                    error,
                    success: false
                })
            }
        }
    }
}

// Stripe Payments
const makeStripePayment = async (req,res) => {
    const {id  , duration  , cardNumber, expMM, expYY, cvv , email , name } = req.body;

    const createdUser = await stripe.customers.create({
        email: email || 'testUser@gmail.com',
        name: name || "123"
    })

    //console.log("createdUser", createdUser)
    if (createdUser)
    {
        try {
            const token = await stripe.tokens.create({ card: {
                number: cardNumber, exp_month: expMM, exp_year: expYY, cvc: cvv } })
           //console.log("token : ", token)
            const AddingCardToUser = await stripe.customers.createSource(createdUser.id, { source: token.id })
            //console.log("AddingCardToUser : ", AddingCardToUser)

           let playListPrice = await PlayLists.findById(id , {price : 1 , _id : 0});
           let totAmount = 0;
           let cuntDate = new Date();
           let endDate = new Date();
            if(duration === "Monthly" ){
                totAmount = playListPrice.price * 30;
                endDate.setDate(cuntDate.getDate() + 30);
            }
            if(duration === "Daily" ){
                totAmount = playListPrice.price * 1;
                endDate.setDate(cuntDate.getDate() + 1);
            }
            if(duration === "Quarterly" ){
                totAmount = playListPrice.price * 120;
                endDate.setDate(cuntDate.getDate() + 120);
            }
            if (duration === "Yearly") {
                totAmount = playListPrice.price * 365;
                endDate.setDate(cuntDate.getDate() + 365);
            }
            const charge = await stripe.charges.create({
                amount: totAmount * 100,
                description: 'Dream App Service Charges',
                currency: 'USD',
                customer: createdUser.id,
                //card: token.id
            })
            //console.log("SuccessFull Charged : ", charge)
            // const invoice = await stripe.invoices.sendInvoice(charge.id);
            // console.log("invoice", invoice)

            // Sending mail to User
            // step 01
            const transport = nodeMailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.myEmail, //own eamil
                    pass: process.env.myPassword, // own password
                }
            })
            // setp 02
            const mailOption = {
                from: process.env.myEmail, // sender/own eamil
                to: email, // reciver/admin eamil
                subject: "!! E-Learning App !! Pyament for Subscription of a PlayList.",
                text: `Dear User. \n E-learning App has Charged Amount of (${totAmount}) from your stripe account for their subscription. \n Thanks.`
            }
            // step 03
            transport.sendMail(mailOption, (err, info) => {
                if (err) {
                    console.log("Error occured : ", err)
                    return res.json({
                        success : false,
                        mesage: "Error in sending mail",
                        err
                    })
                } else {
                    console.log("Email Sent to user SuccessFully : ", info.response)
                }
            })

            // Sending mail to Admin
            // setp 02
            const mailOptionOne = {
                from: process.env.myEmail, // sender/own eamil
                to: process.env.myEmail, // reciver/admin eamil
                subject: "!! E-Learning App !! Pyament Recieved for Subscription of a PlayList.",
                text: `Dear Admin. \n A User has been Charged Amount of (${totAmount}) for his/her subscription. \n Thanks.`
            }
            // step 03
            transport.sendMail(mailOptionOne, (err, info) => {
                if (err) {
                    console.log("Error occured : ", err)
                    return res.json({
                        success : false,
                        mesage: "Error in sending mail",
                        err
                    })
                } else {
                    console.log("Email Sent to Admin SuccessFully : ", info.response)
                }
            })

            // updating user data
            let puchasedPlayListItem = {
                id: id,
                duration : duration,
                endDate: endDate
            }
            let randomNo = (Math.floor(Math.random() * 1000000) + 1000000).toString().substring(1);
            let myOrder = {
                orderId: randomNo,
                total: totAmount,
            }

           await Users.findOneAndUpdate({email : email} , {$push : {puchasedPlayList : puchasedPlayListItem , orders : myOrder}} , {new : true})

            return  res.status(201).json({success : true, message : "Payment Charged Successfully and also a mail has been sent to User as well as Admin."}) ;
        } catch (error) {
            switch (error.type) {
                case 'StripeCardError':
                    // A declined card error
                    console.log(`Error in ${error.type} and error is : `, error.message)
                    error.message; // => e.g. "Your card's expiration year is invalid."
                    break;
                case 'StripeInvalidRequestError':
                    console.log(`Error in ${error.type} and error is : `, error.message)
                    // Invalid parameters were supplied to Stripe's API
                    break;
                case 'StripeAPIError':
                    console.log(`Error in ${error.type} and error is : `, error.message)
                    // An error occurred internally with Stripe's API
                    break;
                case 'StripeConnectionError':
                    console.log(`Error in ${error.type} and error is : `, error.message)
                    // Some kind of error occurred during the HTTPS communication
                    break;
                case 'StripeAuthenticationError':
                    console.log(`Error in ${error.type} and error is : `, error.message)
                    // You probably used an incorrect API key
                    break;
                case 'StripeRateLimitError':
                    console.log(`Error in ${error.type} and error is : `, error.message)
                    // Too many requests hit the API too quickly
                    break;
            }
            return res.status(501).json({success: false , message : `Error in ${error.type} and error is :  ${error.message}`});
        }
    }
}

// get all Users subscribed playlists
const getSubPlayLists = async (req, res) => {
    const {id} = req.params;
    try {
        const allPlayLists = await Users.aggregate([
            {
                $match : {
                    _id : mongoose.Types.ObjectId(id),
                },
            },
            {
                $lookup: {
                    from: 'lmsapptopics',
                    localField: 'puchasedPlayList.id',
                    foreignField: '_id',
                    as: 'puchasedPlayList'
                },
            },
        ]).sort({puchasedPlayList : 0});
        if (allPlayLists === null) {
            return res.json({
                success: false,
                message: 'No Users Found ',
            });
        } else {
            return res.json({
                allPlayLists,
                success: true,
                message: 'Got Result ',
            });
        }
    } catch (error) {
        console.log("Error in getSubPlayLists and error is : ", error)
        return res.json({
            error,
            success: false,
        });
    }
}


///    Admin     Operations      /////




// get all Users
const getAllUsers = async (req, res) => {
    try {
        const allUsers = await Users.find({} ,{ password : 0 , otpCode : 0 , codeSentTime : 0  , orders : 0  , updatedAt : 0  , __v : 0});
        if (!allUsers) {
            return res.json({
                success : false,
                message: 'No User Found ',
            });
        } else {
            return res.json({
                allUsers,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllUsers and error is : ", error)
        return res.json({
            error,
            success: false,
        });
    }
}

// get single User for admin
const getSingleUserAmdin = async (req, res) => {
    const {id} = req.params;
    try {
        const singleUser = await Users.findById(id ,{ password : 0 , otpCode : 0 , codeSentTime : 0 , orders : 0  , updatedAt : 0  , __v : 0   });
        if (!singleUser) {
            return res.json({
                success : false,
                message: 'No User Found ',
            });
        } else {
            return res.json({
                singleUser,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getSingleUserAmdin and error is : ", error)
        return res.json({
            error,
            success: false,
        });
    }
}

// get all Recent Users
const getRecentUsers = async (req, res) => {
    try {
        const allUsers = await Users.find({}).limit(4);
        if (!allUsers) {
            return res.json({
                success: false,
                message: 'No Users Found ',
            });
        } else {
            return res.json({
                allUsers,
                success: true
            });
        }
    } catch (error) {
        console.log("Error in getRecentUsers and error is : ", error)
        return res.json({
            error,
            success: false
        });
    }
}

// get Single Users
const getSingleUser = async (req, res) => {
    const {id} = req.params;

    try {
        const singleUser = await Users.findById(id , {otpCode : 0 , codeSentTime : 0 ,puchasedPlayList : 0  , orders : 0  , createdAt :0 , updatedAt : 0 , __v : 0})

        if (!singleUser) {
            return res.json({
                success: false,
                message: 'No User Found ',
            });
        } else {
            return res.json({
                singleUser,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getSingleUser and error is : ", error)
        return res.json({
            error,
            success: false,
        });
    }
}

// get Single Users Orders Only
const getUsersOrders = async (req, res) => {
    const {id} = req.params;

    try {
        const allOrders = await Users.findById(id , {_id : 0, orders : 1})

        if (allOrders === null) {
            return res.json({
                success: false,
                message: 'No Order Found ',
            });
        } else {
            return res.json({
                allOrders,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getUsersOrders and error is : ", error)
        return res.json({
            error,
            success: false,
        });
    }
}

// get all Users Count
const getAllUsersCount = async (req, res) => {
    try {
        const count = await Users.find({}).count();
        if (!count) {
            return res.json({
                success: false,
                message: 'No User Found ',
            });
        } else {
            return res.json({
                count,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllUsersCount and error is : ", error)
        return res.json({
            error,
            success: false,
        });
    }
}


// delete User
const deleteUser = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const gotUser = await Users.findById(id);
        if (!gotUser) {
            return res.status(201).json({
                success: false,
                message: "No User Found "
            })
        } else {
            // checking if user has any playlist subscription remaining or not
            if (gotUser.puchasedPlayList.length > 0) {
                const curentDate = new Date()
                for(let i = 0; i !== gotUser.puchasedPlayList.length; i++){
                    if (gotUser.puchasedPlayList[i].endDate > curentDate) {
                        return res.status(403).json({
                            success: false,
                            message: "Sorry, but yu can not delete this User, as User has a Subscription End Date for a PlayList which is greater than Current date. Thanks"
                        })
                    }
                }
            }

            const deletedUser = await Users.findByIdAndDelete(id);
            if (!deletedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User Not Found ',
                });
            } else {
                return res.status(200).json({
                    success: true,
                });
            }
        }
    } catch (error) {
        console.log("Error in deleteUser and error is : ", error)
         return res.status(504).json({
             success: false,
         });
    }
}


module.exports = {
    addNewUser,
    LogInUser,
    sendMail,
    checkOtpCode,
    updateUserPass,
    updateUser,
    makeStripePayment,
    getAllUsers,
    getSingleUser,
    getRecentUsers,
    getSubPlayLists,
    getAllUsersCount,
    getUsersOrders,
    getSingleUserAmdin,
    deleteUser
}