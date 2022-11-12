const registerModel = require('../models/registerModel');
const registerService = require('../services/register');

module.exports = {
  index: async (req, res) => {
    const registers = await registerModel.find(
      { userId: req.user._id },
      null,
      { sort: { emitDate: 1 } },
    );
    return res.json(registers);
  },
  store: async (req, res) => {
    const newRegisterData = {
      ...req.body,
      userId: req.user._id,
    };

    try {
      if (newRegisterData.whereAccountBalance) {
        const postRegs = await registerModel.find(
          {
            userId: newRegisterData.userId,
            emitDate: { $gt: newRegisterData.emitDate },
            whereAccountId: newRegisterData.whereAccountId,
          },
          null,
          { sort: { emitDate: 1 } },
        );
        if (postRegs && postRegs.length) {
          newRegisterData.whereAccountBalance = Number(
            (postRegs[0].whereAccountBalance - postRegs[0].value + newRegisterData.value).toFixed(2),
          );
          await registerService.updatePostRegistersOfAccount({
            userId: newRegisterData.userId,
            whereAccountId: newRegisterData.whereAccountId,
            initialAccountBalance: newRegisterData.whereAccountBalance,
            emitDate: newRegisterData.emitDate,
            postRegs,
          });
        }
      }
      const register = await registerModel.create(newRegisterData);
      return res.json(register);
    } catch (error) {
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
      { sort: { emitDate: -1, updatedAt: -1 } },
    );
    res.json(registers);
  },
  sumWhatAccount: async (req, res) => {
    const { accountId, inicialDate, finalDate } = req.body;
    const registers = await registerModel.find({
      'whatAccount.accountId': accountId,
      emitDate: { $gt: inicialDate, $lt: finalDate },
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
    try {
      const { id } = req.params;
      const { updateOnly, ...restRegisterData } = req.body;
      const register = await registerModel.findById(id);

      if (updateOnly) {
        await register.update(restRegisterData);
        return res.json(register);
      }

      let whereAccountBalance = register.whereAccountBalance - register.value + req.body.value;
      if (register.emitDate !== restRegisterData.emitDate) {
        const registerBeforeUpdatedRegister = await registerService.getPreviousRegisterOfAccount({
          userId: restRegisterData.userId,
          whereAccountId: restRegisterData.whereAccountId,
          emitDate: restRegisterData.emitDate,
        });
        whereAccountBalance = registerBeforeUpdatedRegister.whereAccountBalance + req.body.value;
      }

      const updatedRegister = {
        ...restRegisterData,
        whereAccountBalance,
      };

      if (register.whereAccountId !== updatedRegister.whereAccountId) {
        const registerBeforeUpdatedRegister = await registerService.getPreviousRegisterOfAccount({
          userId: updatedRegister.userId,
          whereAccountId: updatedRegister.whereAccountId,
          emitDate: updatedRegister.emitDate,
        });

        updatedRegister.whereAccountBalance = registerBeforeUpdatedRegister.whereAccountBalance + updatedRegister.value;

        await registerService.updatePostRegistersOfAccount({
          userId: register.userId,
          whereAccountId: register.whereAccountId,
          initialAccountBalance: register.whereAccountBalance - register.value,
          emitDate: register.emitDate,
        });
      }

      await registerService.updatePostRegistersOfAccount({
        userId: updatedRegister.userId,
        whereAccountId: updatedRegister.whereAccountId,
        initialAccountBalance: updatedRegister.whereAccountBalance,
        emitDate: updatedRegister.emitDate,
      });

      await register.updateOne(updatedRegister);
      return res.json(register);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
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
          err,
        });
      }
      return res.send({ ok: 'All Clear' });
    });
  },
};
