const { startSession } = require('mongoose');
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
      await session.abortTransaction();
      return res.status(500).json(err);
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

    let session;
    try {
      session = await startSession();
      session.startTransaction();
    } catch (err) {
      return res.status(500).json(err);
    }

    let signal = 1;
    if (opType === 'expense') {
      signal = -1;
    }

    try {
      const allBills = [];
      let billType = 'ToPay';
      if (opType === 'income') billType = 'ToReceive';

      payments.forEach((payment) => {
        if (payment.bills) {
          payment.bills.forEach((bill, index) => {
            allBills.push({
              type: billType,
              value: bill.value,
              dueDate: bill.date,
              installment: `${index + 1}/${payment.bills.length}`,
              whereAccount: payment.id,
            });
          });
        }
      });

      const allRegs = whatAccounts.map((whatAccount) => {
        const value = whatAccount.value * signal;
        const newObj = {
          opType: 'complex',
          whatAccountId: whatAccount.id,
          value,
        };
        if (whatAccount.description) newObj.description = whatAccount.description;
        if (whatAccount.notes) newObj.notes = whatAccount.notes;

        if (payments.length === 1) {
          newObj.whereAccountId = payments[0].id;
          newObj.opType = `${opType}${payments[0].type}`;
        } else {
          const distinctTypes = [...new Set(payments.map(item => item.type))];
          if (distinctTypes.length === 1) {
            newObj.opType = `${opType}${payments[0].type}`;
          }
        }
        return newObj;
      });

      if (payments.length > 1) {
        payments.forEach((payment) => {
          if (payment.type === 'AtSight') {
            const newObj = {
              opType: `${opType}AtSight`,
              whereAccountId: payment.id,
              value: payment.value * signal,
              description: `Op${opDesc ? `: ${opDesc}` : ''}`,
            };
            allRegs.push(newObj);
          }
        });
      }
      const operation = await OperationServices.storeComplexOperation({
        userId,
        emitDate,
        description: opDesc,
        notes: opNotes,
        registers: allRegs,
        bills: allBills,
        session,
      });

      await session.commitTransaction();

      return res.json({ operation });
    } catch (error) {
      await session.abortTransaction();
      return res.status(500).json(error);
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
      await Promise.all(billIds.map(async (billId) => {
        // console.log('will pay:', billId);
        await billModel.findByIdAndUpdate(billId, { paymentDate }, { session });
        // console.log('paid bill:', billId);
      }));
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
    }
  },
};
