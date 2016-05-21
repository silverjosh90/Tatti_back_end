var express = require('express');
var cookieParser = require('cookie-parser');
var knex = require('../db/knex')
var router = express.Router();
var jwt = require('jwt-simple')

/* GET users listing. */
function Users() {
  return knex('users')
}
router.get('/', function(req, res, next) {
  var token = req.header('Authorization').split(' ')[1];
   payload = jwt.decode(token, process.env.TOKEN_SECRET);
  Users().select().where({fb_id: payload.sub}).first().then(function(results){
    res.send(results)
  });

});

module.exports = router;
