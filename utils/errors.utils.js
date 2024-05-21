const multer = require('multer');

module.exports.signUpErrors = (error) =>{
    let errors = { firstname: "", lastname: "", email: "", password: "", login:""}
    if (error.message.includes("firstname") || error.message.includes("lastname")){
        errors.firstname = "Votre Nom est incorrect";
        errors.lastname = "Votre Prenom est incorrect";
    }
    if (error.message.includes("email") || error.code === 11000){
        errors.email = "Votre email est obligatoire ou existe deja";
    }
    if (error.message.includes("password")){
        errors.password = "Votre mot de passe est incorrect";
    }
    if (error.message.includes("login") || error.code === 11000 ){
        errors.login = "ce login existe deja ou le champs login est vide";
    }
    // if (error.code === 11000){
    //     errors.email = "cette email ou ce login existe deja";
    // }

    return errors;
}
module.exports.signInErrors = (error) =>{
    let errors = error 
    return errors;
}

module.exports.uploadErrors = (err, req, res, next) =>{

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "Votre fichier est trop volumineux" });
        }
        if (err.message === "Type de fichier non valide") {
          return res.status(400).json({ message: "Votre fichier n'est pas au bon format image" });
        }
      }
      next(err);
   
}
/**
 * {
    "email":"testemail@gmail.com",
    "password": "Text1234"
}
 */