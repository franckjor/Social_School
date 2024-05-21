require("dotenv").config({path: "./config/.env"});
require ("./config/db"); 
const {CheckUser, requireAuth} = require("./middleware/Auth.middleware")
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const UserRoute = require("./routes/User.Routes")
const PostRoute = require("./routes/Post.Routes")
const cors = require('cors')
const app = express();

const corsOptions ={
    origin: "http://localhost:3000",
    credentials: true,
    "aLlowedHeaders": ["sessionId", "content-type"],
    "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "exposedHeaders": ["sessionId"],
    "methods": "GET,HEAD,POST,PUT,DELETE,PATCH,",
    "preflightContinue": false,
    // "optionsSuccessStatus": 204
}
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());

// controle de l'utilisateur en ligne

app.get("*", CheckUser)
app.get("/jwtid", requireAuth, (req,res) => {
    res.status(200).send(res.locals.user._id);
})


// mes routes
app.use("/api/user", UserRoute);
app.use("/api/post", PostRoute);


app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT }`);
});