const accountsModel = require('../models/accountModel');
const registerModel = require('../models/registerModel');
const initialAccounts = require('../constants/initialAccountsPTBR');

module.exports = {
  async index(req, res) {
    const accounts = await accountsModel.find({ userId: req.user._id });
    return res.json(accounts);
  },
  async all(req, res) {
    const accounts = await accountsModel.find();
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
    const account = await accountsModel.findOneAndUpdate(
      { id, userId: req.user._id }, req.body, { new: true },
    );
    res.json(account);
  },
  async removeByID(req, res) {
    const { id } = req.params;
    const children = await accountsModel.find({ userId: req.user._id, parents: id });
    const toDelete = children.map(child => ({ id: child.id }));
    toDelete.push({ id: Number(id) });

    await accountsModel.deleteMany({
      $and: [{ userId: req.user._id }, { $or: toDelete }],
    });
    const regToDelete = toDelete.map(item => ({
      $or: [{ whereAccountId: item.id }, { whatAccountId: item.id }],
    }));
    await registerModel.deleteMany({
      $and: [{ userId: req.user._id }, { $or: regToDelete }],
    });

    res.json({ ok: toDelete.map(item => item.id) });
  },
  async initialAccounts(req, res) {
    initialAccounts.map(item => ({ ...item, userId: req.user._id }));
    const accounts = await accountsModel.create(initialAccounts);
    return res.json(accounts);
  },
  clearAll: (req, res) => {
    accountsModel.deleteMany({}, (err) => {
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
