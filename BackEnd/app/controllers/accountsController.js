const accountsModel = require('../models/accountModel');
// const settingsModal = require('../models/settingModel');
const registerModel = require('../models/registerModel');

module.exports = {
  async index(req, res) {
    const accounts = await accountsModel.find({ userId: req.user._id });
    return res.json(accounts);
  },
  async insert(req, res) {
    if (!req.body.map) {
      req.body = [req.body];
    }
    const newAccounts = req.body.map(item => ({ ...item, userId: req.user._id }));
    const accounts = await accountsModel.create(newAccounts);

    return res.json(accounts);
  },
  async update(req, res) {
    const { id } = req.params;
    const account = await accountsModel.findOneAndUpdate({ id }, req.body, { new: true });
    res.json(account);
  },
  async removeByID(req, res) {
    const { id } = req.params;
    const children = await accountsModel.find({ parents: id });
    const toDelete = children.map(child => ({ id: child.id }));
    toDelete.push({ id: Number(id) });
    console.log(toDelete);
    await accountsModel.deleteMany({
      $or: toDelete
    });
    const regToDelete = toDelete.map(item => ({
      $or: [{ whereAccountId: item.id }, { whatAccountId: item.id }]
    }));
    console.log('regToDelete:', regToDelete);
    await registerModel.deleteMany({
      $or: regToDelete
    });

    res.json({ ok: toDelete });
  },
  async initialAccounts(req, res) {
    const initialAccounts = require('../constants/initialAccounts').map(item => ({ ...item, userId: req.user._id }));
    const accounts = await accountsModel.create(initialAccounts);
    return res.json(accounts);
  },
  clearAll: (req, res) => {
    accountsModel.deleteMany({}, (err) => {
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
