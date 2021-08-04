const router = require('express').Router();

const jugadorController = require('../../controllers/jugadorController/jugador.controller.js');

router.get('/', jugadorController.createAllPlayers);
router.get('/jugadores', jugadorController.getAllFreePlayers);
router.get('/cargarPuntosJornada/:journeyNumber', jugadorController.cargarPuntosJornada);
router.get('/actualizaJugadoresComunidad/:journeyNumber', jugadorController.actualizaJugadoresComunidad);
router.get('/actualizaJugadoresEquipo/:journeyNumber', jugadorController.generarJornadasYPuntosPorEquipo);
router.put('/actualizaJugadorDelEquipo/:idTeam/:idPlayer/:status', jugadorController.actualizaJugadorDelEquipoYComunidad);
// router.post('/:idUser', comunidadController.createComunidad);
// router.put('/:idComunidad/:idUser', comunidadController.updateComunidad);

module.exports = router;