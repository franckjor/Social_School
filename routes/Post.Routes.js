const router = require("express").Router();
const postController = require("../controllers/Post.controlers");
const multer = require("multer");
const path = require("path");
const storageImages = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../client/public/uploads/posts/images'));
    },
    filename: (req, file, cb) => {
      const randomName = Math.random().toString(36).substring(7);
      const fileName = randomName + path.extname(file.originalname);
      cb(null, fileName);
    }
  });

  const upload = multer({
    storage: storageImages,
    fileFilter: (req, file, cb) => {
      // Vérifier les types de fichiers acceptés ici
      if (
        file.mimetype.includes('image') ||
        file.mimetype.includes('video') ||
        file.mimetype.includes('pdf') ||
        file.mimetype.includes('doc') ||
        file.mimetype.includes('ppt')
      ) {
        cb(null, true);
      } else {
        cb(new Error('Type de fichier non pris en charge'));
      }
    }
  });
  
router.get("/", postController.readPost);
router.post("/", upload.array("file"), postController.createPost);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);
router.patch("/like-post/:id", postController.likePost);
router.patch("/unlike-post/:id", postController.unlikePost);

// Routes liee au commentaires d'un post
router.patch("/comment-post/:id", postController.commentPost);
router.patch("/edit-comment-post/:id", postController.editCommentPost);
router.patch("/delete-comment-post/:id", postController.deleteCommentPost);

module.exports = router;