const express = require('express')
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const path = require("path")
dotenv.config({
    path: './config.env'
})
//const fileupload = require("express-fileupload")
require('./db/conn')
var port = process.env.PORT || 8080;

app.use(bodyParser.json({
    limit: '30mb',
    extended: true
}))
app.use(bodyParser.urlencoded({
    limit: '30mb',
    extended: true
}))
app.use(cors())

// app.use(fileupload({
//     useTempFiles: true
// }))

app.use(express.static('public'));

app.use('/playListImages', express.static('playListImages'));
app.use('/userProfPics', express.static('userProfPics'));
app.use('/videos', express.static('videos'));

app.use(express.json())

// adding routes
app.use(require('./routes/UserRoutes'))
app.use(require('./routes/PlayListRoutes'))
app.use(require('./routes/VideosRoutes'))
// app.use(require('./routes/SubCateRoutes'))
// app.use(require('./routes/DreamRoutes'))
// app.use(require('./routes/JournelRoutes'))
// app.use(require('./routes/CollectionRoutes'))





app.listen(process.env.PORT || 8080, (req, res) => {
    console.log(`Express Server Running at ${port}`)
})