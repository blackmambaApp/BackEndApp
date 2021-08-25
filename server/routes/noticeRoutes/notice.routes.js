const router = require('express').Router();

const noticeController = require('../../controllers/noticeController/notice.controller.js');

router.get('/getNotices/:userId', noticeController.noticesNotShowedForUser)
router.get('/allNotices/:comunityId', noticeController.allNoticesForComunity);
router.put('/noticeShowed/:userId/:noticeId',noticeController.markAsShow);

module.exports = router;