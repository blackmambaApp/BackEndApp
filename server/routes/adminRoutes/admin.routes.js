const router = require('express').Router();

const adminController = require('../../controllers/adminController/adminController.js');

router.post('/manageAdminOffers', adminController.manageAdminOffers)
router.get('/refreshMarkets', adminController.refreshAllComunityMarkets);
router.get('/manageAllUsers', adminController.manageAllSistemUsers);
router.get('/manageAllComunities', adminController.manageAllSistemComunities);

module.exports = router;