const { startSession } = require('mongoose');
const dayjs = require('dayjs');
const operationModel = require('../models/operationModel');
const billModel = require('../models/billModel');
const registerModel = require('../models/registerModel');
const registerService = require('../services/register');

module.exports = {
  index: async (req, res) => {
    const { id } = req.params;
    const operation = await operationModel.findById(id);
    res.json(operation);
  },
  all: async (req, res) => {
    const operations = await operationModel.find();
    res.json(operations);
  },
  store: async (req, res) => {
    req.body.userId = req.user._id;
    const operation = await operationModel.create(req.body);
    if (operation.bills.length > 0) {
      operation.bills.forEach(async (bill) => {
        await billModel.findByIdAndUpdate(bill, { operation: operation._id });
      });
    }
    if (operation.registers.length > 0) {
      operation.registers.forEach(async (register) => {
        await registerModel.findByIdAndUpdate(register, { operation: operation._id });
      });
    }
    res.json(operation);
  },
  delete: async (req, res) => {
    const { id } = req.params;
    await operationModel.findByIdAndDelete(id);
    res.json({ ok: 'deleted' });
  },
  clearAll: (req, res) => {
    operationModel.deleteMany({}, (err) => {
      if (err) {
        return res.send({
          naoOk: 'nao foi removido',
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
  transfer: async (req, res) => {
    const userId = req.user._id;
    const {
      fromWhereAccountId,
      toWhereAccountId,
      value,
      description,
      emitDate,
    } = req.body;

    try {
      const session = await startSession();
      session.startTransaction();

      const registerBeforeFrom = await registerService.getPreviousRegisterOfAccount({
        userId,
        whereAccountId: fromWhereAccountId,
        emitDate,
      });

      const fromRegisterPayload = {
        userId,
        emitDate,
        opType: 'transference',
        whereAccountId: fromWhereAccountId,
        whereAccountBalance: registerBeforeFrom.whereAccountBalance - value,
        description,
        value: -value,
      };
      const fromReg = await registerModel.create([fromRegisterPayload], { session });

      await registerService.updatePostRegistersOfAccount({
        userId,
        whereAccountId: fromWhereAccountId,
        initialAccountBalance: fromRegisterPayload.whereAccountBalance,
        emitDate,
        session,
      });

      const registerBeforeTo = await registerService.getPreviousRegisterOfAccount({
        userId,
        whereAccountId: toWhereAccountId,
        emitDate,
      });

      const toRegisterPayload = {
        userId,
        emitDate,
        opType: 'transference',
        whereAccountId: toWhereAccountId,
        whereAccountBalance: registerBeforeTo.whereAccountBalance + value,
        description,
        value,
      };
      const toReg = await registerModel.create([toRegisterPayload], { session });

      await registerService.updatePostRegistersOfAccount({
        userId,
        whereAccountId: toWhereAccountId,
        initialAccountBalance: toRegisterPayload.whereAccountBalance,
        emitDate,
        session,
      });

      const registers = [fromReg[0].id, toReg[0].id];


      const operationPayload = {
        userId,
        registers,
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
