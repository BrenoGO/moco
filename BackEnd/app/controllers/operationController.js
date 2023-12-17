const { startSession } = require('mongoose');
const dayjs = require('dayjs');
const operationModel = require('../models/operationModel');
const billModel = require('../models/billModel');
const registerModel = require('../models/registerModel');
const registerService = require('../services/register');
const OperationServices = require('../services/operation');

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
  search: async (req, res) => {
    const keys = Object.keys(req.body);
    const objSearch = { userId: req.user._id };
    keys.forEach((key) => {
      objSearch[key] = req.body[key];
    });
    const operations = await operationModel.find(
      objSearch,
      null,
      { sort: { emitDate: -1, createdAt: -1 } },
    );

    res.json(operations);
  },
  /**
   *
   * @deprecated: use custom routes for each operation type. There is a bug, register is not saving operation id
   *
   */
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

    let session;
    try {
      session = await startSession();
      session.startTransaction();
    } catch (err) {
      return res.status(500).json(err);
    }

    try {
      // create international register
      const registerBeforeNewInterReg = await registerService.getPreviousRegisterOfAccount({
        userId,
        whereAccountId: internAccountId,
        emitDate,
        createdAt: new Date(),
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
        notId: internReg._id,
        createdAt: internReg.createdAt,
      });

      const registerBeforeNewLocalReg = await registerService.getPreviousRegisterOfAccount({
        userId,
        whereAccountId: localAccountId,
        emitDate,
        createdAt: new Date(),
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
        createdAt: new Date(),
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
      await session.abortTransaction();
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

    let session;
    try {
      session = await startSession();
      session.startTransaction();
    } catch (err) {
      return res.status(500).json(err);
    }

    try {
      const registerBeforeFrom = await registerService.getPreviousRegisterOfAccount({
        userId,
        whereAccountId: fromWhereAccountId,
        emitDate,
        createdAt: new Date(), // we will create the new register now
      });

      const fromRegisterPayload = {
        userId,
        emitDate,
        opType: 'transference',
        whereAccountId: fromWhereAccountId,
        whereAccountBalance: (registerBeforeFrom?.whereAccountBalance || 0) - value,
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
        notId: fromReg._id,
        createdAt: fromReg.createdAt,
      });

      const registerBeforeTo = await registerService.getPreviousRegisterOfAccount({
        userId,
        whereAccountId: toWhereAccountId,
        emitDate,
        createdAt: new Date(), // we will create the new register now
      });

      const toRegisterPayload = {
        userId,
        emitDate,
        opType: 'transference',
        whereAccountId: toWhereAccountId,
        whereAccountBalance: (registerBeforeTo?.whereAccountBalance || 0) + value,
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
        createdAt: toReg.createdAt,
        notId: toReg._id,
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
      await session.abortTransaction();
      return res.status(500).json(error);
    }
  },
  future: async (req, res) => {
    let session;
    try {
      session = await startSession();
      session.startTransaction();
    } catch (err) {
      console.log('error starting transaction...');
      console.log(err);
      return res.status(500).json(err);
    }

    try {
      await OperationServices.storeOperation({
        userId: req.user._id,
        emitDate: req.body.emitDate,
        description: req.body.description,
        notes: req.body.notes,
        registers: req.body.registers,
        bills: req.body.bills,
        session,
      });

      await session.commitTransaction();

      return res.json({ success: 'future operation stored' });
    } catch (err) {
      console.log('error trying to store future operation...');
      console.log(err);
      await session.abortTransaction();
      return res.status(500).json(err);
    }
  },
  removeOperation: async (req, res) => {
    const { id } = req.params;

    let session;
    try {
      session = await startSession();
      session.startTransaction();
    } catch (err) {
      console.log('error starting transaction...');
      console.log(err);
      return res.status(500).json(err);
    }

    try {
      const operationRegisters = await registerModel.find({
        operation: id,
      });

      const operationBills = await billModel.find({
        operation: id,
      });

      if (operationRegisters) {
        await Promise.all(operationRegisters.map(async (reg) => {
          await registerModel.findByIdAndDelete(reg._id, { session });
        }));
      }

      if (operationBills) {
        await Promise.all(operationBills.map(async (bill) => {
          await billModel.findByIdAndDelete(bill._id, { session });
        }));
      }

      await operationModel.findByIdAndDelete(id, { session });

      await session.commitTransaction();

      return res.json({ success: 'Removed operation' });
    } catch (err) {
      console.log('error trying to delete...');
      console.log(err);
      await session.abortTransaction();
      return res.status(500).json(err);
    }
  },
};
