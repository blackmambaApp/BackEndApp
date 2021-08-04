const router = require('express').Router();

const comunidadController = require('../../controllers/comunidadController/comunidadController.js');


router.get('/', comunidadController.getComunidades);
router.get('/:idUser', comunidadController.getOneComunidad);
router.post('/:idUser', comunidadController.createComunidad);
router.put('/:idComunidad/:idUser', comunidadController.addUserAndUpdateComunidad);
router.put('/update', comunidadController.updateComunidad);

module.exports = router;
