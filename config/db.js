const mongoose = require('mongoose');

mongoose
    .connect("mongodb+srv://" + process.env.DB_USER_PASS +"@cluster0.nalmjnv.mongodb.net/social_media_school",
    {
        serverSelectionTimeoutMS: 5000, 
        heartbeatFrequencyMS: 5000, 
    }).then(()=>{
        console.log("Connected to MongoDB");
    }).catch((error)=>{
        console.log(" Failed to connect to MongoDB",error);
    });