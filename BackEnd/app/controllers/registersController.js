const registerModel = require('../models/registerModel');

module.exports = {
  index: async (req, res) => {
    const registers = await registerModel.find(
      { userId: req.user._id },
      null,
      { sort: { emitDate: 1 } }
    );
    return res.json(registers);
  },
  store: async (req, res) => {
    req.body.userId = req.user._id;

    try {
      if (req.body.whereAccountBalance) {
        const postRegs = await registerModel.find(
          {
            userId: req.user._id,
            emitDate: { $gt: req.body.emitDate },
            whereAccountId: req.body.whereAccountId
          },
          null,
          { sort: { emitDate: 1 } }
        );
        if (postRegs.length > 0) {
          // has post regs
          req.body.whereAccountBalance = Number(
            (postRegs[0].whereAccountBalance - postRegs[0].value + req.body.value).toFixed(2)
          );
          for (const i in postRegs) {
            if (i === '0') {
              postRegs[i].whereAccountBalance = Number(
                (req.body.whereAccountBalance + postRegs[i].value).toFixed(2)
              );
            } else {
              postRegs[i].whereAccountBalance = Number(
                (postRegs[i - 1].whereAccountBalance + postRegs[i].value).toFixed(2)
              );
            }
            await registerModel.findByIdAndUpdate(
              postRegs[i]._id,
              { whereAccountBalance: postRegs[i].whereAccountBalance }
            );
          }
        }
      }
      const register = await registerModel.create(req.body);
      return res.json(register);
    } catch (error) {
      console.log(error);
      return res.json(error);
    }
  },
  search: async (req, res) => {
    const keys = Object.keys(req.body);
    const objSearch = { userId: req.user._id };
    keys.map((key) => {
      if (key === 'whatAccount' || key === 'whereAccount') {
        const subKeys = Object.keys(req.body[key]);
        subKeys.map((subKey) => {
          const str = `${key}.${subKey}`;
          objSearch[str] = req.body[key][subKey];
          return true;
        });
      } else {
        objSearch[key] = req.body[key];
      }
      return true;
    });
    const registers = await registerModel.find(
      objSearch,
      null,
      { sort: { emitDate: -1, updatedAt: -1 } }
    );
    res.json(registers);
  },
  sumWhatAccount: async (req, res) => {
    const { accountId, inicialDate, finalDate } = req.body;
    const registers = await registerModel.find({
      'whatAccount.accountId': accountId,
      emitDate: { $gt: inicialDate, $lt: finalDate }
    }, { 'whatAccount.value': true, _id: false });
    const sumReg = registers.reduce((sum, reg, index) => {
      if (index === 1) {
        return (sum.whatAccount.value + reg.whatAccount.value);
      }
      return sum + reg.whatAccount.value;
    });
    res.json(sumReg);
  },
  update: async (req, res) => {
    console.log('\n\n entrou no update');
    console.log('req.body');
    console.log(req.body);
    const { id } = req.params;
    const register = await registerModel.findByIdAndUpdate(id, req.body, { new: true });
    console.log('register');
    console.log(register);
    return res.json(register);
  },
  removeById: (req, res) => {
    const { id } = req.params;
    registerModel.findByIdAndDelete(id, (err) => {
      if (err) {
        return res.send({ err });
      }
      return res.send({ ok: 'Register deleted' });
    });
  },
  clearAll: (req, res) => {
    registerModel.deleteMany({}, (err) => {
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
