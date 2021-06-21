const router = require('express').Router();

const jugadorController = require('../../controllers/jugadorController/jugador.controller.js');

router.get('/', jugadorController.createAllPlayers);
router.get('/jugadores', jugadorController.getAllFreePlayers);
// router.post('/:idUser', comunidadController.createComunidad);
// router.put('/:idComunidad/:idUser', comunidadController.updateComunidad);

module.exports = router;