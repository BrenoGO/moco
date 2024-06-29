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
      if (reg.opType.endsWith('AtSight')) {
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
  storeOperation: async ({
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
};

module.exports = OperationServices;
