const settingModel = require('../models/settingModel');
const registerModel = require('../models/registerModel');
const accountModel = require('../models/accountModel');

module.exports = {
  getDefaults: async (req, res) => {
    const response = {};
    const settings = await settingModel.findOne({ userId: req.user._id });

    response.defaultAccounts = settings.data.defaultAccounts;
    response.locale = settings.data.locale;
    const currentAccounts = await accountModel.find(
      {
        userId: req.user._id,
        parents: response.defaultAccounts.currentAccounts,
        allowValue: true
      },
      { id: true, name: true, _id: false }
    );

    const currentAccountsBalance = currentAccounts.map(async (ac) => {
      let balance = 0;
      const lastReg = await registerModel.findOne(
        { userId: req.user._id, whereAccountId: ac.id },
        { whereAccountBalance: true, createdAt: true, _id: false },
      ).sort({ createdAt: -1 });
      if (lastReg && lastReg.whereAccountBalance) balance = lastReg.whereAccountBalance;
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

    const setting = await settingModel.findOne({ userId: req.user._id });
    const newSetting = JSON.parse(JSON.stringify(setting));
    newSetting.data[name] = req.body.data;
    const newSetting2 = await settingModel.findByIdAndUpdate(
      setting._id, { data: newSetting.data }, { new: true }
    );
    res.json(newSetting2);
  },
  initialSettings: async (req, res) => {
    const settings = await settingModel.create({
      data: require('../constants/initialSettings'), userId: req.user._id
    });
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
