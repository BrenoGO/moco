const settingModel = require('../models/settingModel');
const registerModel = require('../models/registerModel');
const accountModel = require('../models/accountModel');

module.exports = {
  getDefaults: async (req, res) => {
    const response = {};
    const defaultAccounts = await settingModel.findOne({ userId: req.user._id, name: 'defaultAccounts' });
    response.defaultAccounts = defaultAccounts.data;

    const currentAccounts = await accountModel.find(
      { userId: req.user._id, parents: 3, allowValue: true },
      { id: true, name: true, _id: false }
    );

    const currentAccountsBalance = currentAccounts.map(async (ac) => {
      let balance = 0;
      const lastReg = await registerModel.findOne(
        { whereAccountId: ac.id },
        { whereAccountBalance: true, createdAt: true, _id: false },
      ).sort({ createdAt: -1 });
      if (lastReg) balance = lastReg.whereAccountBalance;
      return { accountId: ac.id, balance };
    });
    response.balances = await Promise.all(currentAccountsBalance);
    res.json(response);
  },
  index: async (req, res) => (
    res.json(await settingModel.find({ userId: req.user._id }))
  ),
  store: async (req, res) => (
    res.json(await settingModel.create({ ...req.body, userId: req.user._id }))
  ),
  update: async (req, res) => {
    const { name } = req.params;
    const setting = await settingModel.findOneAndUpdate(
      { userId: req.user._id, name },
      req.body,
      { new: true }
    );
    res.json(setting);
  },
  initialSettings: async (req, res) => {
    const initialSettings = require('../constants/initialSettings').map(item => ({ ...item, userId: req.user._id }));
    const settings = await settingModel.create(initialSettings);
    return res.json(settings);
  },
  clearAll: (req, res) => {
    settingModel.deleteMany({}, (err) => {
      if (err) {
        return res.send({
          notOk: 'not deleted',
          err
        });
      }
      return res.send({ ok: 'All Clear' });
    });
  }
};
