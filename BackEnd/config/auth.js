

const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');

const userModel = require('../app/models/userModel');
const { encrypt } = require('./cryptography');

const secretOrKey = process.env.JWT_SECRET_OR_KEY;
const { ExtractJwt, Strategy: JwtStrategy } = passportJWT;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  secretOrKey
};

module.exports = {
  get auth() {
    const strategy = new JwtStrategy(jwtOptions, ((jwtPayload, next) => {
      userModel.findById(jwtPayload._id).exec().then((user) => {
        if (user) {
          next(null, user);
        } else {
          next(null, false);
        }
      });
    }));
    passport.use(strategy);
    return {
      initialize() {
        return passport.initialize();
      },
      get authenticate() {
        return passport.authenticate('jwt', { session: false });
      }
    };
  },
  login(email, password, callback) {
    const enPW = encrypt(password);
    userModel.findOne({ email, password: enPW }).exec().then((user) => {
      if (user) {
        const payload = { _id: user._id };
        const token = jwt.sign(payload, jwtOptions.secretOrKey);
        callback({ message: 'ok', token });
      } else {
        callback(false);
      }
    });
  }
};
