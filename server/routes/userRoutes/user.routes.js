const express = require('express'); 
const { use } = require('passport');
const router = express.Router();

const userController = require('../../controllers/userController/user.controller');

router.get('/', userController.getUsers);
router.post('/signup', userController.createUsers);
router.post('/signin', userController.singnWithUser);
router.post('/signinWithComunity', userController.signUserAfterComunityCreate);
router.post('/leaveComunity/:userId/:comunityId', userController.leaveUserFromComunity);
router.get('/:id', userController.getOneUser);
router.get('/byEmail/:email', userController.getOneUserByEmail);
router.delete('/:id', userController.deleteUser);
router.put('/update/:id',userController.updateUser);

module.exports = router;