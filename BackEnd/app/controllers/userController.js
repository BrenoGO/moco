const settingModel = require('../models/settingModel');
const registerModel = require('../models/registerModel');
const accountModel = require('../models/accountModel');
const userModel = require('../models/userModel');
const billModel = require('../models/billModel');
const operationModel = require('../models/operationModel');
const initialSettingsList = require('../constants/initialSettings');
const initialAccountsList = require('../constants/initialAccountsPTBR');

const { encrypt } = require('../../config/cryptography');
const { login, signUp } = require('../../config/auth');


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
  signUp: (req, res) => {
    signUp(req.body, async (result) => {
      if (result) {
        if (result.errmsg) {
          const obj = { error: { code: result.code, message: result.errmsg } };
          return res.status(422).json(obj);
        }
        const thisObj = { data: initialSettingsList, userId: result.userId };
        const settings = await settingModel.create(thisObj);
        const initialAccounts = initialAccountsList.map(item => ({ ...item, userId: result.userId }));
        const accounts = await accountModel.create(initialAccounts);
        return res.json({ token: result.token, defaults: settings.data, accounts });
      }
      return res.status(422).json({ error: { message: 'result was falsy' } });
    });
  },
  removeUser: async (req, res) => {
    const { id } = req.params;
    await settingModel.deleteMany({ userId: id });
    await registerModel.deleteMany({ userId: id });
    await accountModel.deleteMany({ userId: id });
    await billModel.deleteMany({ userId: id });
    await operationModel.deleteMany({ userId: id });
    await userModel.findByIdAndDelete(id);

    return res.json({ ok: 'user deleted' });
  },
  login: (req, res) => {
    const { email, password } = req.body;
    login(email, password, (result) => {
      if (result) {
        return res.json(result);
      }
      return res.status(401).json({ message: 'email or password is incorrect.' });
    });
  },
  update: async (req, res) => {
    if (req.body.newPassword) {
      const password = encrypt(req.body.newPassword);
      const user = await userModel.findByIdAndUpdate(req.user._id, { password });
      return res.json(user);
    }
    const user = await userModel.findByIdAndUpdate(req.user._id, req.body);
    return res.json(user);
  },
  clearAll: (req, res) => {
    userModel.deleteMany({}, (err) => {
      if (err) {
        return res.send({
          notOk: 'not deleted',
          err,
        });
      }
      return res.send({ ok: 'All Clear' });
    });
  },
};
