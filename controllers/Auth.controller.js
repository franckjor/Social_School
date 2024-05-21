const userModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const expiresInDuration = "24h";
const { signUpErrors, signInErrors } = require("../utils/errors.utils")

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: expiresInDuration,
    });
}

module.exports.signUp = async (req, res) =>{
    const { firstname, lastName, email, password} = req.body
    try {
        const user = await userModel.create({ firstname, lastName, email, password});
        res.status(201).json({user: user._id})
    } catch (error) {
        const errors = signUpErrors(error);
        res.status(200).json({ errors, error: error.message });
    }
}

module.exports.signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.login(email, password);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, expiresIn: expiresInDuration });
        res.status(201).json({ user: user._id, token: token , firstname: user.firstname, lastname: user.lastname});
    } catch (err) {
        const errors = signInErrors(err.message);
        res.status(200).json( {errors});
    }
};
module.exports.logOut = async (req, res) =>{
    try {
        res.clearCookie("jwt"); 
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}
