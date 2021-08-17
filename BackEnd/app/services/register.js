const registerModel = require('../models/registerModel');

module.exports = {
  async updatePostRegistersOfAccount(req) {
    if (!req.body.whereAccountBalance) {
      return;
    }
    const postRegs = await registerModel.find(
      {
        userId: req.user._id,
        emitDate: { $gt: req.body.emitDate },
        whereAccountId: req.body.whereAccountId,
      },
      null,
      { sort: { emitDate: 1 } },
    );
    if (!postRegs.length) return;

    let { whereAccountBalance } = req.body;

    await Promise.all(postRegs.map(async (reg) => {
      whereAccountBalance = Number(
        (whereAccountBalance + reg.value).toFixed(2),
      );
      await registerModel.findByIdAndUpdate(
        reg._id,
        { whereAccountBalance },
      );
    }));
  },
};
