const router = require('express').Router();

const offersController = require('../../controllers/offersController/offers.controller.js');

router.get('/getOffer/:teamId', offersController.getOffersToTeam);
router.get('/getOfferById/:offerId', offersController.getOffersById);
router.post('/createOffer', offersController.createOffer);
router.put('/acceptOffer/:offerId',offersController.acceptOffer);
router.put('/rejectOffer/:offerId',offersController.rejectOffer);
router.put('/inactivateOffers/',offersController.inactivateOffers);



module.exports = router;