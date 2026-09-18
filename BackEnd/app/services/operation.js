const registerModel = require('../models/registerModel');
const billModel = require('../models/billModel');
const operationModel = require('../models/operationModel');
const RegisterServices = require('./register');

const OperationServices = {
  storeComplexOperation: async ({
    userId, emitDate, description, notes, registers, bills, session,
  }) => {
    const [operation] = await operationModel.create([{
      userId,
      emitDate,
      description,
      notes,
    }], { session });
    // console.log('.... operation');
    // console.log(operation);

    const { atSightRegistersByAccountId, whatAccountRegisters } = registers.reduce((acc, reg) => {
      if (reg.opType.endsWith('AtSight') && reg.whereAccountId) {
        // adding 1 millisecond to at sight registers to order
        if (acc.atSightRegistersByAccountId[reg.whereAccountId]) {
          return {
            atSightRegistersByAccountId: {
              ...acc.atSightRegistersByAccountId,
              [reg.whereAccountId]: acc.atSightRegistersByAccountId[reg.whereAccountId].concat({
                ...reg,
                operation: operation._id,
              }),
            },
            whatAccountRegisters: acc.whatAccountRegisters,
          };
        }
        return {
          atSightRegistersByAccountId: {
            ...acc.atSightRegistersByAccountId,
            [reg.whereAccountId]: [{
              ...reg,
              operation: operation._id,
            }],
          },
          whatAccountRegisters: [...acc.whatAccountRegisters],
        };
      }

      return {
        atSightRegistersByAccountId: { ...acc.atSightRegistersByAccountId },
        whatAccountRegisters: [...acc.whatAccountRegisters, {
          ...reg,
          emitDate,
          userId,
          operation: operation._id,
        }],
      };
    }, { atSightRegistersByAccountId: {}, whatAccountRegisters: [] });

    // console.log('atSightRegistersByAccountId');
    // console.log(atSightRegistersByAccountId);
    // console.log('whatAccountRegisters');
    // console.log(whatAccountRegisters);

    const registerIds = (await Promise.all((Object.keys(atSightRegistersByAccountId).map(async (accountId) => {
      // console.log(`accountId: ${accountId}`);
      const regsParams = atSightRegistersByAccountId[accountId];
      // console.log(`regsParams`);
      // console.log(regsParams);
      const regs = await RegisterServices.insertRegistersInWhereAccountWithValue({
        userId,
        emitDate,
        whereAccountId: accountId,
        registers: regsParams,
        session,
      });

      // console.log(`regs for ${accountId}`);
      // console.log(regs);
      return regs.map(reg => reg._id);
    })))).flat();

    // console.log('\n\n registerIds');
    // console.log(registerIds);

    if (whatAccountRegisters?.length) {
      const whatAccountRegs = await registerModel.create(
        whatAccountRegisters,
        { session },
      );

      registerIds.push(...whatAccountRegs.map(reg => reg._id));
      // console.log('\n\n registerIds again..');
      // console.log(registerIds);
    }

    const billsIds = [];

    if (bills.length) {
      const billsResp = await billModel.create(
        bills.map(bill => ({
          ...bill,
          emitDate,
          userId,
          operation: operation._id,
        })),
        { session },
      );

      billsIds.push(...billsResp.map(bill => bill._id));
    }

    // console.log('\n\n billsIds..');
    // console.log(billsIds);

    const updatedOperation = await operationModel.findByIdAndUpdate(
      operation._id,
      {
        bills: billsIds,
        registers: registerIds,
      },
      { session, new: true },
    );

    // console.log('updatedOperation');
    // console.log(updatedOperation);
    return updatedOperation;
  },
  storeFutureOperation: async ({
    userId, emitDate, description, notes, registers, bills, session,
  }) => {
    const [operation] = await operationModel.create([{
      userId,
      emitDate,
      description,
      notes,
    }], { session });

    const registersResp = await registerModel.create(
      registers.map(reg => ({ ...reg, userId, operation: operation._id })),
      { session },
    );

    const billsResp = await billModel.create(
      bills.map(bill => ({ ...bill, userId, operation: operation._id })),
      { session },
    );

    await operationModel.findByIdAndUpdate(
      operation._id,
      {
        bills: billsResp.map(bill => bill._id),
        registers: registersResp.map(reg => reg._id),
      },
      { session, new: true },
    );
  },
  removeOperation: async ({ id, userId, session }) => {
    const operationRegisters = await registerModel.find({
      operation: id,
    });

    const operationBills = await billModel.find({
      operation: id,
    });

    // validate registers belong to user
    if (operationRegisters.some(r => r.userId.toString() !== userId.toString())) {
      throw new Error('Some registers do not belong to the user');
    }

    // validate bills belong to user
    if (operationBills.some(b => b.userId.toString() !== userId.toString())) {
      throw new Error('Some bills do not belong to the user');
    }

    if (operationRegisters) {
      const {atSightRegs, restRegs} = operationRegisters.reduce((acc, r) => {
        if (r.opType.endsWith('AtSight') && r.whereAccountId) {
          return {
            atSightRegs: [...acc.atSightRegs, r],
            restRegs: [...acc.restRegs],
          }
        }
        return {
          atSightRegs: [...acc.atSightRegs],
          restRegs: [...acc.restRegs, r],
        }
      }, { atSightRegs: [], restRegs: [] });

      await Promise.all(atSightRegs.map(async (reg) => {
        await RegisterServices.removeRegisterInWhereAccountWithValue({ register: reg, session });
      }));

      // delete rest registers
      await Promise.all(restRegs.map(async (reg) => {
        await registerModel.findByIdAndDelete(reg._id, { session });
      }));
    }

    if (operationBills) {
      await Promise.all(operationBills.map(async (bill) => {
        await billModel.findByIdAndDelete(bill._id, { session });
      }));
    }

    await operationModel.findByIdAndDelete(id, { session });
  },
  storeOperation: async ({
    opType, userId, emitDate, opDesc, opNotes, whatAccounts, payments, session,
  }) => {
    if (!opType || !userId || !emitDate || !whatAccounts || !payments || !session) {
      throw new Error('Missing required parameters');
    }

    if (!Array.isArray(whatAccounts) || !Array.isArray(payments)) {
      throw new Error('whatAccounts and payments must be arrays');
    }

    console.log('storing operation...');
    let signal = 1;
    if (opType === 'expense') {
      signal = -1;
    }
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
            paymentKey: payment.paymentKey || null,
          });
        });
      }
    });

    const allRegs = whatAccounts.map((whatAccount) => {
      const value = whatAccount.value * signal;
      const newObj = {
        opType,
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
            description: `Complex Op${opDesc ? `: ${opDesc}` : ''}`,
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

    return operation;
  }
};

module.exports = OperationServices;
