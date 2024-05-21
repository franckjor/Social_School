const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userShema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true,
            maxLength: 55,
        },
        lastName: {
            type: String,
            required: true,
            maxLength: 55,
        },
        email: {
            type: String,
            required: true,
            validate: [isEmail],
            lowercase: true,
            unique: true,
            trim: true,
        },
        login: {
            type: String,
            // required: true,
            lowercase: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            maxLength: 1024,
            minlength: 8
        },
        picture: {
            type: String,
            default: "./uploads/profil/random-user.png"
        },
        bio :{
            type: String,
            max: 1024,
        },
        followers: {
            type: [String]
        },
        following: {
            type: [String]
        },
        likes: {
            type: [String]
        },
        isStudent: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

// cryptage du password
userShema.pre("save", async function(next){
    const salt = await bcrypt.genSalt();
    this.password =await bcrypt.hash(this.password, salt);
    next();
});

userShema.statics.login = async function (email, password) {
    const user = await this.findOne({ email: email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error("Mot de passe incorrect!");
    }
    throw Error("Votre adresse email n'est pas correct!");
}

const UserModel = mongoose.model("User", userShema);
module.exports = UserModel;