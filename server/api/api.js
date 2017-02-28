var express = require('express');
var area = require('./area');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send('api');
});

/* GET users listing. */
router.use('/area', area);

/* GET users listing. */
// router.get('/manager', function(req, res, next) {
//     res.send('respond with a resource');
// });

module.exports = router;
