const registerModel = require('../models/registerModel');
const billModel = require('../models/billModel');
const operationModel = require('../models/operationModel');

const OperationServices = {
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
