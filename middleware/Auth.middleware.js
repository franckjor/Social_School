const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

module.exports.CheckUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                res.clearCookie("jwt");
                next();
            } else {
                try {
                    const user = await UserModel.findById(decodedToken.id);
                    res.locals.user = user;
                    console.log(user);
                    next();
                } catch (error) {
                    res.locals.user = null;
                    next();
                }
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};

module.exports.requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                console.log(err);
            } else {
                console.log(decodedToken.id);
                next();
            }
        });
    } else {
        console.log("No token");
    }
};