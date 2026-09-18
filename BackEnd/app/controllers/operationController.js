const { startSession } = require('mongoose');
const operationModel = require('../models/operationModel');
const billModel = require('../models/billModel');
const registerModel = require('../models/registerModel');
const registerService = require('../services/register');
const OperationServices = require('../services/operation');

module.exports = {
  index: async (req, res) => {
    console.log('getting operation by id...');
    const userId = req.user._id;
    const { id } = req.params;
    const operation = await operationModel.findById(id).populate({
      path: 'registers bills',
      select: [
        'description', 'notes', 'value', 'opType', 'whatAccountId', 'whereAccountId',
        'dueDate', 'installment', 'whereAccount', 'type', 'paymentKey', 'paymentDate'
      ],
    });
    // console.log('operation///');
    // console.log(operation)

    if (operation && operation.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(operation);
  },
  // all: async (req, res) => {
  //   const operations = await operationModel.find();
  //   res.json(operations);
  // },
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
  deleteOnly: async (req, res) => {
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
        session,
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
        session,
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

      // eslint-disable-next-line no-restricted-syntax
      for (const whatAccount of whatAccounts) {
        localAccountBalance -= whatAccount.value;
        const newReg = await registerModel.create([{
          userId,
          emitDate,
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
        emitDate,
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
    } finally {
      if (session) {
        await session.endSession();
      }
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
        session,
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
        session,
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
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  },
  future: async (req, res) => {
    let session;
    try {
      session = await startSession();
      session.startTransaction();
    } catch (err) {
      return res.status(500).json(err);
    }

    try {
      await OperationServices.storeFutureOperation({
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
      await session.abortTransaction();
      return res.status(500).json(err);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  },
  removeOperation: async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    let session;
    try {
      session = await startSession();
      session.startTransaction();
    } catch (err) {
      return res.status(500).json(err);
    }

    try {
      await OperationServices.removeOperation({ id, userId, session });

      await session.commitTransaction();

      return res.json({ success: 'Removed operation' });
    } catch (err) {
      console.log('error removing operation...');
      console.error(err);
      await session.abortTransaction();
      return res.status(500).json(err);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  },
  editOperation: async (req, res) => {
    console.log('editing operation...');
    const { id } = req.params;
    const userId = req.user._id;
    const {
      emitDate,
      opType,
      opDesc,
      opNotes,
      whatAccounts,
      payments,
    } = req.body;

    let session;
    try {
      session = await startSession();
      session.startTransaction();
    } catch (err) {
      return res.status(500).json(err);
    }

    try {
      await OperationServices.removeOperation({ id, userId, session });

      const operation = await OperationServices.storeOperation({
        opType, userId, emitDate, opDesc, opNotes, whatAccounts, payments,  
        session
      });

      await session.commitTransaction();

      return res.json({ operation });
    } catch (err) {
      console.log('error removing operation...');
      console.error(err);
      await session.abortTransaction();
      return res.status(500).json(err);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  },
  complex: async (req, res) => {
    const userId = req.user._id;
    const {
      emitDate,
      opType,
      opDesc,
      opNotes,
      whatAccounts,
      payments,
    } = req.body;

    // console.log('payments');
    // console.log(payments);
    // console.log('whatAccounts');
    // console.log(whatAccounts);
    let session;
    try {
      session = await startSession();
      session.startTransaction();
    } catch (err) {
      return res.status(500).json(err);
    }
    
    try {
      const operation = await OperationServices.storeOperation({
        opType, userId, emitDate, opDesc, opNotes, whatAccounts, payments,  
        session
      });

      await session.commitTransaction();

      return res.json({ operation });
    } catch (error) {
      console.log('Error.......:');
      console.log(error);
      await session.abortTransaction();
      return res.status(500).json(error);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  },
  payment: async (req, res) => {
    const userId = req.user._id;
    const {
      paymentDate,
      value,
      whereAccountId,
      billIds,
    } = req.body;

    let session;
    try {
      session = await startSession();
      session.startTransaction();
    } catch (err) {
      return res.status(500).json(err);
    }

    try {
      const bills = await billModel.find(
        {
          _id: { $in: billIds },
          userId,
          paymentDate: { $exists: false },
        },
        null,
        { session }
      );

      if (bills.length !== billIds.length) {
        throw new Error('Some bills are invalid or already paid');
      }

      // await Promise.all(billIds.map(async (billId) => {
      //   // console.log('will pay:', billId);
      //   await billModel.findByIdAndUpdate(billId, { paymentDate }, { session });
      //   // console.log('paid bill:', billId);
      // }));
      await billModel.updateMany(
        { _id: { $in: billIds }, userId },
        { $set: { paymentDate } },
        { session }
      );

      const emitDate = paymentDate;

      const register = await registerService.insertRegisterInWhereAccountWithValue({
          register: {
            userId,
            emitDate,
            opType: 'payment',
            whereAccountId,
            value,
          },
          session,
        });

        // console.log('register');
        // console.log(register);

      const [operation] = await operationModel.create([{
            userId,
            emitDate,
            description: 'Payment',
            bills: billIds,
            registers: [register._id],
          }], { session });

      // console.log('operation in payment....:', operation);

      await session.commitTransaction();

      return res.json({ operation });
    } catch (error) {
      console.log('Error:', error);
      await session.abortTransaction();
      return res.status(500).json(error);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  },
};
