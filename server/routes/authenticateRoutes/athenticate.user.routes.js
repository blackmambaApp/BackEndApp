const router = require('express').Router();
const passport = require('passport');

router.get('/authenticate', (req,res,next) => {
    res.render('http://localhost:4200/authenticate');
});

module.exports = router;