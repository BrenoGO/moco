const registerModel = require('../models/registerModel');

module.exports = {
  updatePostRegistersOfAccount: async ({
    userId, whereAccountId, initialAccountBalance, emitDate, postRegs: postRegsParam, session,
  }) => {
    const postRegs = postRegsParam || await registerModel.find(
      {
        userId,
        emitDate: { $gt: emitDate },
        whereAccountId,
      },
      null,
      { sort: { emitDate: 1 }, session },
    );
    if (!postRegs.length) return;

    let currentBalance = initialAccountBalance;
    await Promise.all(postRegs.map(async (reg) => {
      currentBalance = Number(
        (currentBalance + reg.value).toFixed(2),
      );
      await registerModel.findByIdAndUpdate(
        reg._id,
        { whereAccountBalance: currentBalance },
        { session },
      );
    }));
  },

  getPreviousRegisterOfAccount: async ({
    userId, whereAccountId, emitDate,
  }) => registerModel.findOne(
    {
      userId,
      emitDate: { $lt: emitDate },
      whereAccountId,
    },
    null,
    { sort: { emitDate: -1 } },
  ),
};
