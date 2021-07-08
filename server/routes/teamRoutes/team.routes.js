const router = require('express').Router();

const teamController = require('../../controllers/equipoController/equipo.controller');

router.get('/', teamController.getEquipoByComunidad);
router.put('/edit', teamController.updateTeam);
router.get('/:idUser', teamController.getTeamByUserId);
router.post('/create/:idComunidad/:idUser', teamController.createTeamInComunity);
router.post('/changeAlignement/:idTeam', teamController.changeAlignmentForTheTeam);

module.exports = router;