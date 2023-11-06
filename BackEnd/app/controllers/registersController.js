const { startSession } = require('mongoose');
const dayjs = require('dayjs');
const registerModel = require('../models/registerModel');
const operationModel = require('../models/operationModel');
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
        whereAccountBalance = registerBeforeUpdatedRegister
          ? registerBeforeUpdatedRegister.whereAccountBalance + req.body.value
          : req.body.value;
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
  international: async (req, res) => {
    const userId = req.user._id;
    const {
      emitDate,
      internAccountId,
      dollarValue,
      whatAccountIdForInter,
      localAccountId,
      totalValue,
      incomeAccountIdForLocal,
      whatAccounts,
    } = req.body;

    try {
      const session = await startSession();
      session.startTransaction();

      // create international register
      const registerBeforeNewInterReg = await registerService.getPreviousRegisterOfAccount({
        userId,
        whereAccountId: internAccountId,
        emitDate,
      });

      const internationalRegisterPayload = {
        userId,
        emitDate,
        opType: 'expenseAtSight',
        whereAccountId: internAccountId,
        whereAccountBalance: registerBeforeNewInterReg.whereAccountBalance + dollarValue,
        whatAccountId: whatAccountIdForInter,
        value: dollarValue,
      };
      const internReg = await registerModel.create([internationalRegisterPayload], { session });

      await registerService.updatePostRegistersOfAccount({
        userId,
        whereAccountId: internAccountId,
        initialAccountBalance: internationalRegisterPayload.whereAccountBalance,
        emitDate,
        session,
      });

      const registerBeforeNewLocalReg = await registerService.getPreviousRegisterOfAccount({
        userId,
        whereAccountId: localAccountId,
        emitDate,
      });

      let localAccountBalance = (registerBeforeNewLocalReg?.whereAccountBalance || 0)
        + -totalValue; // totalValue is negative, to income register it will be positive

      const incomeLocalRegPayload = {
        userId,
        emitDate,
        opType: 'incomeAtSight',
        whereAccountId: localAccountId,
        whereAccountBalance: localAccountBalance,
        whatAccountId: incomeAccountIdForLocal,
        value: -totalValue,
      };
      const incomeLocalReg = await registerModel.create([incomeLocalRegPayload], { session });

      const restRegsIds = [internReg[0].id, incomeLocalReg[0].id];

      let newEmitDate = emitDate;
      // eslint-disable-next-line no-undef, no-restricted-syntax
      for (const whatAccount of whatAccounts) {
        localAccountBalance -= whatAccount.value;
        newEmitDate = dayjs(newEmitDate).add(1, 'ms').toDate();
        // eslint-disable-next-line no-await-in-loop
        const newReg = await registerModel.create([{
          userId,
          emitDate: newEmitDate,
          opType: 'expenseAtSight',
          whereAccountId: localAccountId,
          whereAccountBalance: localAccountBalance,
          whatAccountId: whatAccount.id,
          value: -whatAccount.value,
          description: whatAccount.description,
          notes: whatAccount.notes,
        }], { session });

        restRegsIds.push(newReg[0]._id);
      }

      await registerService.updatePostRegistersOfAccount({
        userId,
        whereAccountId: localAccountId,
        initialAccountBalance: localAccountBalance,
        emitDate: dayjs(newEmitDate).add(1, 'ms').toDate(),
        session,
      });

      const operationPayload = {
        userId,
        registers: restRegsIds,
        emitDate,
      };

      const operation = await operationModel.create([operationPayload], { session });

      await session.commitTransaction();

      return res.json({ operation });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};
