const userModel = require("../models/UserModel");
const objectId = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getUserInfo = async (req, res) => {
    try {
        if (!objectId.isValid(req.params.id)) {
            return res.status(400).send("ID unknown: " + req.params.id);
        }
        
        const user = await userModel.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).send("User not found");
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error("Error retrieving user:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports.userUpdate = async (req, res) => {
    try {
        if (!objectId.isValid(req.params.id)) {
            return res.status(400).send("ID unknown: " + req.params.id);
        }

        const updatedUser = await userModel.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { "bio": req.body.bio } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (!updatedUser) {
            return res.status(404).send("User not found");
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports.userDelete = async (req, res) => {
    try {
        if (!objectId.isValid(req.params.id)) {
            return res.status(400).send("ID unknown: " + req.params.id);
        }

        const deletedUser = await userModel.findOneAndDelete({ _id: req.params.id }).exec();

        if (!deletedUser) {
            return res.status(404).send("User not found");
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports.followuser = async (req,res) =>{
    try {
        if (!objectId.isValid(req.params.id) || !objectId.isValid(req.body.idToFollow)) {
            return res.status(400).send("ID unknown: " + req.params.id);
        }
        // Ajouter le follower au tableau 'following' de l'utilisateur cible
        const followuser = await userModel.findByIdAndUpdate(
            req.params.id,
            {$addToSet:{following: req.body.idToFollow}},
            { new: true, upsert: true }
        );

        if (!followuser) {
            return res.status(404).send("User not found");
        }

        res.status(201).json({ message: "User follow successfully" });

        // Ajouter l'utilisateur cible aux 'followers' de l'utilisateur suivant
        const followinguser = await userModel.findOneAndUpdate(
            { _id: req.body.idToFollow },
            {$addToSet:{followers: req.params.id}},
            { new: true, upsert: true }
        );
        if (!followinguser) {
            return res.status(404).send("sorry user not found or following");
        }
        
        
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(400).json({ error: error.message });
    }

};

module.exports.unfollowuser = async (req,res) =>{
    try {
        if (!objectId.isValid(req.params.id) || !objectId.isValid(req.body.idToUnfollow)) {
            return res.status(400).send("ID unknown: " + req.params.id);
        }
        // Retirer le follower du tableau 'following' de l'utilisateur cible
        const unfollowuser = await userModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { following: req.body.idToUnfollow } }, // Utilisez $pull pour retirer un élément d'un tableau
            { new: true, upsert: true }
        );

        if (!unfollowuser) {
            return res.status(404).send("User not found");
        }

         // Si tout s'est bien passé, envoyer une réponse
         res.status(201).json({ message: "User unfollowed successfully" });

        // Retirer l'utilisateur cible des 'followers' de l'utilisateur suivant
        const followinguser = await userModel.findByIdAndUpdate(
            req.body.idToUnfollow,
            { $pull: { followers: req.params.id } }, // Utilisez $pull pour retirer un élément d'un tableau
            { new: true, upsert: true }
        );

        if (!followinguser) {
            return res.status(404).send("Sorry, user not found or not being followed");
        }
        
        
    } catch (error) {
        console.error("Error unfollowing user:", error);
        res.status(400).json({ error: error.message });
    }

};
