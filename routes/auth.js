var express = require('express');
var router = express.Router();
var request = require('request');
var knex = require('../db/knex')
var cookieParser = require('cookie-parser');
var moment = require('moment')
var jwt = require('jwt-simple')
require('dotenv').load()

function Users() {
  return knex('users')
}

function createJWT(user) {
  var payload = {
    sub: user.fb_id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, process.env.TOKEN_SECRET);
}


router.post('/facebook', function(req,res){
  var fields = ['id', 'email', 'first_name', 'last_name'];
  var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
  var params = {
  code: req.body.code,
  client_id: req.body.clientId,
  client_secret: process.env.FACEBOOK_SECRET,
  redirect_uri: req.body.redirectUri
 };
   request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: accessToken.error.message });
      }
      request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
        if (response.statusCode !== 200) {
          return res.status(500).send({ message: profile.error.message });
        }
          var user = {}
          var image = 'https://graph.facebook.com/'+profile.id+'/picture?type=large'
          user.profilepicture = 'https://graph.facebook.com/'+profile.id+'/picture?type=large'
          user.fb_id = profile.id
          user.email = profile.email
          user.firstName = profile.first_name
          user.lastName = profile.last_name
          var token = createJWT(user);

          Users().select().where({fb_id: profile.id}).then(function(result){
            if(!result.length) {
              Users().insert(user).returning('*').then(function(rest){
                var results = rest
                results.token = process.env.FACEBOOK_SECRET
                res.send({ token: token });

              })
            }
            else {
              loggedIn = result
              loggedIn.token = process.env.FACEBOOK_SECRET
              res.send({ token: token });
            }
          })
      })
    });
  })

module.exports = router;
