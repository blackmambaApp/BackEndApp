const router = require('express').Router();
const multer = require("multer");
const teamController = require('../../controllers/equipoController/equipo.controller');


const storage = multer.diskStorage({
    destination : (req, file,callback) => {
        callback(null, "../src/static/images")
    },
    filename: (req, file,callback) => {
        callback(null, file.originalname);
    }
})
const upload = multer({storage : storage});


router.get('/getEquipo/:idComunidad', teamController.getEquipoByComunidad);
router.put('/edit', teamController.updateTeam);
router.get('/:idUser', teamController.getTeamByUserId);
router.post('/create/:idComunidad/:idUser',upload.single("image"),teamController.createTeamInComunity);
router.put('/insertTeamInComunity/:idComunidad/:idTeam', teamController.actualizaComunidadConEquipo);
router.post('/changeAlignement/:idTeam', teamController.changeAlignmentForTheTeam);
router.delete('/deleteTeam/:idTeam/:nickName', teamController.deleteTeamAndExitComunity);
module.exports = router;