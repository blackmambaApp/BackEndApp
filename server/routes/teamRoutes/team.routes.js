const router = require('express').Router();

const teamController = require('../../controllers/equipoController/equipo.controller');

router.get('/', teamController.getEquipoByComunidad);
router.get('/:idUser', teamController.getTeamByUserId);
router.post('/create/:idComunidad/:idUser', teamController.createTeamInComunity);
router.post('/changeAlignement/:idTeam', teamController.changeAlignmentForTheTeam);
// router.post('/:idUser', comunidadController.createComunidad);
// router.put('/:idComunidad/:idUser', comunidadController.updateComunidad);

module.exports = router;