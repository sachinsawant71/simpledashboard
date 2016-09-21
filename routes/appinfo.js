var express = require('express');
var router = express.Router();

var startTime = new Date();

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.send({
    startTime :  startTime
  });
});

module.exports = router;
