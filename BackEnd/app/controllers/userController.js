const userModel = require('../models/userModel');
const { encrypt } = require('../../config/cryptography');
const { login } = require('../../config/auth');


module.exports = {
  listUsers: async (req, res) => {
    const users = await userModel.find({});
    return res.json(users);
  },
  userById: async (req, res) => {
    const { id } = req.params;
    const user = await userModel.findById(id);
    return res.json({ ...user._doc });
  },
  addUser: async (req, res) => {
    const { name, email, password } = req.body;

    const pwDB = encrypt(password);
    const user = await userModel.create({ name, email, password: pwDB });
    return res.json(user);
  },
  removeUser: (req, res) => {
    const { id } = req.params;
    userModel.findByIdAndDelete(id, (err) => {
      if (err) {
        return res.send({ message: 'erro ao remover', err });
      }
      return res.send({ ok: 'removed' });
    });
  },
  login: (req, res) => {
    const { email, password } = req.body;
    login(email, password, (result) => {
      if (result) {
        return res.json(result);
      }
      return res.status(401).json({ message: 'email or password is incorrect.' });
    });
  }
};
