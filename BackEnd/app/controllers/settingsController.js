const settingModel = require('../models/settingModel');
const registerModel = require('../models/registerModel');
const accountModel = require('../models/accountModel');

module.exports = {
  getDefaults: async (req, res) => {
    const response = {
      defaultAccounts: {
        whereId: 0,
        whatId: 0
      },
      balances: [
        { accountId: 5, balance: 93.38 },
      ]
    };
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
        { whereAccountBalance: true }
      ).sort({ created_at: -1 });
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
};
