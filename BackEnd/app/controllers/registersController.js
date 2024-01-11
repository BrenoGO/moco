const { startSession } = require('mongoose');
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

    let session;
    try {
      session = await startSession();
      session.startTransaction();
    } catch (err) {
      return res.status(500).json(err);
    }

    try {
      // whereAccountBalance is to decide is it is a current account or future account
      if (newRegisterData.whereAccountBalance) {
        const register = await registerService.insertRegisterInWhereAccountWithValue({
          register: newRegisterData,
          session,
        });

        await session.commitTransaction();
        return res.json(register);
      }

      const register = await registerModel.create([newRegisterData], { session });

      await session.commitTransaction();
      return res.json(register);
    } catch (error) {
      await session.abortTransaction();
      return res.status(500).json(error);
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
      { sort: { emitDate: -1, createdAt: -1 } },
    );

    res.json(registers);
  },
  incomeOrExpenseReport: async (req, res) => {
    const {
      opTypePrefix, whatAccountId, emitDate, searchDesc,
    } = req.body;
    const objSearch = {
      userId: req.user._id, whatAccountId, emitDate, opType: { $regex: opTypePrefix },
    };

    if (!objSearch.whatAccountId) {
      // sempre precisa de uma whatAccountId para relatório de despesa ou receita
      objSearch.whatAccountId = {
        $ne: null,
      };
    }
    if (searchDesc) {
      objSearch.description = {
        $regex: searchDesc, $options: 'i',
      };
    }

    const registers = await registerModel.find(
      objSearch,
      null,
      { sort: { emitDate: -1, createdAt: -1 } },
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
    let session;
    try {
      session = await startSession();
      session.startTransaction();
    } catch (err) {
      return res.status(500).json(err);
    }

    try {
      const { id } = req.params;
      const { updateOnly, ...restRegisterData } = req.body;
      const oldRegister = await registerModel.findById(id);

      if (updateOnly) {
        await oldRegister.update(restRegisterData);
        return res.json(oldRegister);
      }

      // console.log('....oldRegister.....');
      // console.log(oldRegister);


      // register udated where account, needs to update the balances for old account
      if (oldRegister.whereAccountId !== restRegisterData.whereAccountId) {
        await registerService.updatePostRegistersOfAccount({
          userId: oldRegister.userId,
          whereAccountId: oldRegister.whereAccountId,
          initialAccountBalance: oldRegister.whereAccountBalance - oldRegister.value,
          emitDate: oldRegister.emitDate,
          createdAt: oldRegister.createdAt,
          session,
        });
      }

      const registerBeforeUpdatedRegister = await registerService.getPreviousRegisterOfAccount({
        userId: restRegisterData.userId,
        whereAccountId: restRegisterData.whereAccountId,
        emitDate: restRegisterData.emitDate,
        notId: id,
        createdAt: oldRegister.createdAt,
      });
      const whereAccountBalance = registerBeforeUpdatedRegister
        ? registerBeforeUpdatedRegister.whereAccountBalance + restRegisterData.value
        : restRegisterData.value;

      const updatedRegister = {
        ...restRegisterData,
        whereAccountBalance,
      };

      // console.log('....updatedRegister.....');
      // console.log(updatedRegister);

      await oldRegister.update(updatedRegister, { session });
      // console.log('old Register');
      // console.log(oldRegister);

      await registerService.updatePostRegistersOfAccount({
        userId: updatedRegister.userId,
        whereAccountId: updatedRegister.whereAccountId,
        initialAccountBalance: updatedRegister.whereAccountBalance,
        emitDate: updatedRegister.emitDate,
        createdAt: updatedRegister.createdAt,
        session,
      });

      await session.commitTransaction();

      return res.json(oldRegister);
    } catch (err) {
      await session.abortTransaction();
      // console.log('err');
      // console.log(err);
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
