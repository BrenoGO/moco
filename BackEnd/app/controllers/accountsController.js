const accountsModal = require('../models/accountModel');
const registerModel = require('../models/registerModel');

module.exports = {
  async index(req, res) {
    const accounts = await accountsModal.find({ userId: req.user._id });
    return res.json(accounts);
  },
  async insert(req, res) {
    if (!req.body.map) {
      req.body = [req.body];
    }
    const newAccounts = req.body.map(item => ({ ...item, userId: req.user._id }));
    const accounts = await accountsModal.create(newAccounts);

    return res.json(accounts);
  },
  async update(req, res) {
    const { id } = req.params;
    const account = await accountsModal.findOneAndUpdate({ id }, req.body, { new: true });
    res.json(account);
  },
  async removeByID(req, res) {
    const { id } = req.params;
    const children = await accountsModal.find({ parents: id });
    const toDelete = children.map(child => ({ id: child.id }));
    toDelete.push({ id: Number(id) });
    console.log(toDelete);
    await accountsModal.deleteMany({
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
  async startsDefault(req, res) {
    const defaultAccounts = require('../constants/defaultAccounts').map(item => ({ ...item, userId: req.user._id }));
    const accounts = await accountsModal.create(defaultAccounts);
    return res.json(accounts);
  },
  clearAll: (req, res) => {
    accountsModal.deleteMany({}, (err) => {
      if (err) {
        return res.send({
          naoOk: 'nao foi removido',
          err
        });
      }
      return res.send({ ok: 'All Clear' });
    });
  }
};
