const accountsModal = require('../models/accountModel');

module.exports = {
  async index(req, res) {
    const accounts = await accountsModal.find({ userID: req.user._id });
    return res.json(accounts);
  },
  async insert(req, res) {
    if (!req.body.map) {
      req.body = [req.body];
    }
    const newAccounts = req.body.map(item => ({ ...item, userID: req.user._id }));
    const accounts = await accountsModal.create(newAccounts);

    return res.json(accounts);
  },
  async update(req, res) {
    const { id } = req.params;
    const account = await accountsModal.findOneAndUpdate({ _id: id }, req.body, { new: true });
    res.json(account);
  },
  async removeByID(req, res) {
    const { id } = req.params;
    const children = await accountsModal.find({ parents: id });
    const toDelete = children.map(child => ({ _id: child.id }));
    toDelete.push({ _id: id });

    await accountsModal.deleteMany({
      $or: toDelete
    });

    res.json({ ok: toDelete });
  },
  async startsDefault(req, res) {
    const { rootAccounts, firstLevel, secondLevel } = require('../constants/defaultAccounts');
    const rAccounts = rootAccounts.map(item => ({ ...item, userID: req.user._id }));
    const accounts = await accountsModal.create(rAccounts);
    let nAc = [];

    const newFirstLevel = firstLevel.map(item => (
      {
        ...item,
        userID: req.user._id,
        parents: [accounts.find(ac => ac.name === item.parentName)._id]
      }
    ));
    nAc = await accountsModal.create(newFirstLevel);
    accounts.push(...nAc);

    const newSecondLevel = secondLevel.map((item) => {
      const parent = accounts.find(ac => ac.name === item.parentName);
      return ({
        ...item,
        userID: req.user._id,
        parents: [...parent.parents, parent._id]
      });
    });
    nAc = await accountsModal.create(newSecondLevel);
    accounts.push(...nAc);

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
