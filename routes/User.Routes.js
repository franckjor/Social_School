const router = require("express").Router();
const multer = require("multer");
const sharp = require("sharp");
const authController = require("../controllers/Auth.controller")
const userController = require("../controllers/User.controller")
const uploadController = require("../controllers/upload.controller");
const { uploadErrors } = require("../utils/errors.utils");

const upload = multer({
    //storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Type d'image non valide"));
        }
        cb(undefined, true);
    }
})

//Authentication
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", authController.logOut);

//user CRUD
router.get("/", userController.getAllUsers);
router.get ("/:id", userController.getUserInfo);
router.put("/:id", userController.userUpdate);
router.delete("/:id", userController.userDelete);
router.patch("/follow/:id", userController.followuser);
router.patch("/unfollow/:id", userController.unfollowuser);

//upload
router.post("/upload",upload.single("file"), uploadErrors, uploadController.uploadProfile);

module.exports = router; 