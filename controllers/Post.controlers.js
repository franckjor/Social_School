const PostModel = require("../models/Post.Model");
const UserModel = require("../models/UserModel");
const objectId = require("mongoose").Types.ObjectId;
const { validationResult } = require("express-validator");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const mime = require("mime-types");
const videoMetadata = require('video-metadata-thumbnails');


module.exports.readPost = (req, res) => {
  PostModel.find()
    .sort({ createdAt: -1 })
    .then(docs => {
      res.send(docs);
    })
    .catch(err => {
      console.log("Error to get Posts: " + err);
    });
};

module.exports.createPost = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ error: "Aucun fichier n'a été téléchargé" });
    }

    const pictures = [];
    const video = [];
    const documents = [];

    console.log("all files", req.files);

    for (const file of Object.values(req.files)) {
      const mimeType = mime.lookup(file.originalname);
      if (mimeType.startsWith("image/")) {
        const randomName = Math.random().toString(36).substring(7);
        const fileName = randomName + ".jpg";

        try {
          const filePath = path.join(
            __dirname,
            "../client/public/uploads/posts/images",
            fileName
          );
          fs.copyFileSync(file.path, filePath);
          fs.unlinkSync(file.path);

          pictures.push(`./uploads/posts/images/${fileName}`);
        } catch (error) {
          console.error("Erreur lors de la sauvegarde de l'image :", error);

          return res.status(400).json({
            error: error.message
          });
        }
      };
      if (mimeType.startsWith("video/")) {
        const randomName = Math.random().toString(36).substring(7);
        const fileName = randomName + path.extname(file.originalname);


        try {
          const filePath = path.join(
            __dirname,
            "../client/public/uploads/posts/videos",
            fileName
          );
          fs.copyFileSync(file.path, filePath);
          fs.unlinkSync(file.path);
      
          video.push(`./uploads/posts/videos/${fileName}`);
        } catch (error) {
          console.error("Erreur lors de la sauvegarde de la vidéo :", error);

          return res.status(400).json({
            error: error.message
          });
        }
      }
      if (
        mimeType == "application/msword" ||
        mimeType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimeType == "application/pdf" ||
        mimeType == "application/vnd.ms-powerpoint" ||
        mimeType == "application/vnd.openxmlformats-officedocument.presentationml.presentation" 
      ) {
        console.log ("hey petit tu me no meme")
        const randomName = Math.random().toString(36).substring(7);
        const fileName = randomName + path.extname(file.originalname);
        try {
          const filePath = path.join(
            __dirname,
            "../client/public/uploads/posts/documents",
            fileName
          );
          fs.copyFileSync(file.path, filePath);
          fs.unlinkSync(file.path);

          documents.push(`./uploads/posts/documents/${fileName}`);
        } catch (error) {
          console.error("Erreur lors de la sauvegarde du document :", error);

          return res.status(400).json({
            error: error.message
          });
        }
      }
    }

    // Création du nouveau post avec le tableau d'images
    const newPost = new PostModel({
      posterId: req.body.posterId,
      message: req.body.message,
      video,
      pictures,
      documents,
      likers: [],
      comments: []
    });

    // Sauvegarde du post dans la base de données
    const post = await newPost.save();

    // Envoi de la réponse avec le post créé
    res.status(201).json(post);
  } catch (error) {
    // Gestion des erreurs générales
    console.error(error);
    res
      .status(400)
      .json({ error: "Une erreur est survenue lors de la création du post" });
  }
};

module.exports.updatePost = async (req, res) => {
  try {
    if (!objectId.isValid(req.params.id)) {
      return res.status(400).send("ID unknown: " + req.params.id);
    }
    const updatePost = {
      message: req.body.message
    };

    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $set: updatePost },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).send("Post not found");
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error retrieving user:", error);

    const updatedPostWithError = {
      ...updatePost,
      error: error.message
    };

    res.status(500).json(updatedPostWithError);
  }
};

module.exports.deletePost = async (req, res) => {
  try {
    if (!objectId.isValid(req.params.id)) {
      return res.status(400).send("ID unknown: " + req.params.id);
    }

    const removePost = await PostModel.findOneAndDelete(req.params.id);

    if (!removePost) {
      return res.status(404).send("Post did not remove");
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error retrieving user:", error);
    console.error("Error updating post:", error);

    const removePostWithError = {
      ...removePost,
      error: error.message
    };

    res.status(500).json(removePostWithError);
  }
};

module.exports.likePost = async (req, res) => {
  try {
    if (!objectId.isValid(req.params.id)) {
      return res.status(400).send("ID unknown: " + req.params.id);
    }

    const likePost = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likers: req.body.likers } },
      { new: true }
    );

    if (!likePost) {
      return res.status(400).send("Failed to like the post!");
    }

    const userlikely = await UserModel.findByIdAndUpdate(
      req.body.likers,
      { $addToSet: { likes: req.params.id } },
      { new: true }
    );

    if (!userlikely) {
      return res.status(400).send("Failed to update user's liked posts!");
    }

    res.status(200).json({ likePost, userlikely });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports.unlikePost = async (req, res) => {
  try {
    if (!objectId.isValid(req.params.id)) {
      return res.status(400).send("ID unknown: " + req.params.id);
    }

    const unlikePost = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { likers: req.body.likers } },
      { new: true }
    );

    if (!unlikePost) {
      return res.status(400).send("Failed to unlike the post!");
    }

    const userUnlikely = await UserModel.findByIdAndUpdate(
      req.body.likers,
      { $pull: { postsLiked: req.params.id } },
      { new: true }
    );

    if (!userUnlikely) {
      return res.status(400).send("Failed to update user's unliked posts!");
    }

    res.status(200).json({ unlikePost, userUnlikely });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports.commentPost = async (req, res) => {
  try {
    if (!objectId.isValid(req.params.id)) {
      return res.status(400).send("ID unknown: " + req.params.id);
    }
    const commented = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterlogin: req.body.commenterlogin,
            text: req.body.text,
            timestamp: new Date().getTime()
          }
        }
      },
      { new: true }
    );
    if (!commented) {
      return res.status(400).send("Failed to comment the post!");
    }

    res.status(200).send(commented);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json(error);
  }
};

module.exports.editCommentPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Vérifier si l'ID du commentaire est valide
    if (!objectId.isValid(req.params.id)) {
      return res
        .status(400)
        .send("ID du commentaire inconnu: " + req.params.id);
    }

    // Récupérer l'article contenant le commentaire à éditer
    const editedPost = await PostModel.findById(req.params.id);
    if (!editedPost) {
      return res.status(404).send("Article non trouvé");
    }

    // Récupérer le commentaire à éditer
    const commentToEdit = editedPost.comments.find(comment =>
      comment._id.equals(req.body.commentId)
    );
    if (!commentToEdit) {
      return res.status(404).send("Commentaire non trouvé");
    }

    // Mettre à jour le texte et le timestamp du commentaire
    commentToEdit.text = req.body.text;
    commentToEdit.timestamp = new Date().getTime();

    // Sauvegarder les modifications de l'article
    const updatedPost = await editedPost.save();
    if (!updatedPost) {
      return res.status(500).send("Échec de l'édition du commentaire");
    }

    // Renvoyer l'article mis à jour
    res.status(200).send(updatedPost);
  } catch (error) {
    console.error("Erreur lors de l'édition du commentaire:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteCommentPost = async (req, res) => {
  try {
    // Vérifier si l'ID du commentaire est valide
    if (!objectId.isValid(req.params.id)) {
      return res
        .status(400)
        .send("ID du commentaire inconnu: " + req.params.id);
    }

    // Rechercher l'article contenant le commentaire à supprimer
    const editedPost = await PostModel.findById(req.params.id);
    if (!editedPost) {
      return res.status(404).send("Article non trouvé");
    }

    // Rechercher et supprimer le commentaire
    const commentIndex = editedPost.comments.findIndex(comment =>
      comment._id.equals(req.body.commentId)
    );
    if (commentIndex === -1) {
      return res.status(404).send("Commentaire non trouvé");
    }

    editedPost.comments.splice(commentIndex, 1);
    const fs = require("fs");
    const path = require("path");

    module.exports.uploadProfile = async (req, res) => {
      try {
        const validImageExtensions = [".jpeg", ".jpg", ".png"];

        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        if (!validImageExtensions.includes(fileExtension)) {
          return res
            .status(400)
            .json({ message: "Extension d'image non valide" });
        }

        if (req.file.size > 5000000) {
          return res.status(400).json({ message: "Taille d'image non valide" });
        }

        const randomName = Math.random().toString(36).substring(7);
        const fileName = randomName + fileExtension;

        await fs.promises.rename(
          req.file.path,
          path.join(__dirname, "../client/public/uploads/profile", fileName)
        );

        return res.status(200).json({
          message: "Image de profil téléchargée avec succès",
          fileName
        });
      } catch (error) {
        console.error(
          "Erreur lors du téléchargement de l'image de profil:",
          error
        );
        return res.status(500).json({ error: error.message });
      }
    };
    // Sauvegarder les modifications de l'article
    const updatedPost = await editedPost.save();
    if (!updatedPost) {
      return res.status(500).send("Échec de la suppression du commentaire");
    }

    // Renvoyer l'article mis à jour
    res.status(200).send(updatedPost);
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire:", error);
    res.status(500).json({ error: error.message });
  }
};
