"use strict";
const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');

const userModel = require('../app/models/userModel');
const secretOrKey = require('./private').JWTsecretOrKey;
const { encrypt } = require('./private');

const { ExtractJwt, Strategy: JwtStrategy } = passportJWT;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  secretOrKey
};

module.exports = {
  get auth(){
    const strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next){
      userModel.findById(jwt_payload._id).exec().then(user => {
        if(user){
          next(null, user);
        }else{
          next(null, false);
        }
      });
    });
    passport.use(strategy);
    return {
      initialize: function(){
        return passport.initialize();
      },
      get authenticate(){
        return passport.authenticate('jwt', {session: false});
      }
    };
  },
  login: function(email, password, callback){
    const enPW = encrypt(password);
    userModel.findOne({email, password: enPW}).exec().then(user => {
      if(user){
        const payload = { _id: user._id };
        var token = jwt.sign(payload, jwtOptions.secretOrKey);
        callback({message: 'ok', token});
      }else{
        callback(false);
      }
    });
  }
};
