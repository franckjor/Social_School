const UserModel = require("../models/UserModel");
const sharp = require("sharp");
const path = require("path");
const { uploadErrors } = require("../utils/errors.utils");

module.exports.uploadProfile = async (req, res) => {
  try {
    const randomName = Math.random().toString(36).substring(7); 
    const fileName = randomName + ".jpg";

    await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .toFile(
        path.join(__dirname, "../client/public/uploads/profile", fileName)
      );
    const userProfile = await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $set: { picture: "./uploads/profile/" + fileName } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (!userProfile) {
      return res.status(404).send("User not found");
    }
    return res.status(200).json({
      message: "Image de profil téléchargée avec succès",
      fileName,
      userProfile,
    });
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image de profil:", error);
    return res.status(500).json({ errors, error: error.message });
  }
};