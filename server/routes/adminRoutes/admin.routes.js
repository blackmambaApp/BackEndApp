const router = require('express').Router();

const adminController = require('../../controllers/adminController/adminController.js');

router.post('/manageAdminOffers', adminController.manageAdminOffers)
router.get('/refreshMarkets', adminController.refreshAllComunityMarkets);

module.exports = router;