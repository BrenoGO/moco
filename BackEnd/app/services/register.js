const dayjs = require('dayjs');
const registerModel = require('../models/registerModel');

const RegisterServices = {
  insertRegisterInWhereAccountWithValue: async ({
    register,
    session,
  }) => {
    // console.log('register');
    // console.log(register);

    const registerBefore = await RegisterServices.getPreviousRegisterOfAccount({
      userId: register.userId,
      whereAccountId: register.whereAccountId,
      emitDate: register.emitDate,
      notId: register._id,
      createdAt: new Date(),
    });

    // console.log('register before:');
    // console.log(registerBefore);

    const registerParams = {
      ...register,
      whereAccountBalance: (registerBefore?.whereAccountBalance || 0) + register.value,
    };

    // console.log('registerParams:');
    // console.log(registerParams);

    const [storedRegister] = await registerModel.create([registerParams], { session });

    // console.log('storedRegister:');
    // console.log(storedRegister);

    await RegisterServices.updatePostRegistersOfAccount({
      userId: register.userId,
      whereAccountId: register.whereAccountId,
      initialAccountBalance: storedRegister.whereAccountBalance,
      emitDate: register.emitDate,
      createdAt: storedRegister.createdAt,
      session,
    });

    return storedRegister;
  },
  insertRegistersInWhereAccountWithValue: async ({
    userId,
    emitDate,
    whereAccountId,
    registers,
    session,
  }) => {
    // console.log('register');
    // console.log(register);

    const registerBefore = await RegisterServices.getPreviousRegisterOfAccount({
      userId,
      whereAccountId,
      emitDate,
      createdAt: new Date(),
    });

    // console.log('register before:');
    // console.log(registerBefore);

    let balance = registerBefore?.whereAccountBalance || 0;

    // console.log('initial account balance');
    // console.log(balance);

    const registersParams = registers.map((reg, index) => {
      // console.log('reg');
      // console.log(reg);

      balance += reg.value;

      // console.log('new balance');
      // console.log(balance);

      const regEmitDate = dayjs(emitDate).add(index, 'milliseconds').toDate();

      return {
        ...reg,
        userId,
        whereAccountId,
        emitDate: regEmitDate,
        whereAccountBalance: balance,
      };
    });

    // console.log('registersParams:');
    // console.log(registersParams);

    const storedRegisters = await registerModel.create(registersParams, { session });

    // console.log('storedRegisters:');
    // console.log(storedRegisters);

    await RegisterServices.updatePostRegistersOfAccount({
      userId,
      whereAccountId,
      initialAccountBalance: balance,
      emitDate,
      createdAt: storedRegisters[storedRegisters.length - 1].createdAt,
      session,
    });

    return storedRegisters;
  },
  updatePostRegistersOfAccount: async ({
    userId, whereAccountId, initialAccountBalance, emitDate, postRegs: postRegsParam, session, createdAt, notId,
  }) => {
    const postRegs = postRegsParam || await registerModel.find(
      {
        userId,
        emitDate: { $gte: emitDate },
        whereAccountId,
        _id: {
          $ne: notId,
        },
      },
      null,
      { sort: { emitDate: 1, createdAt: 1 }, session },
    );
    if (!postRegs.length) return;

    // console.log('postRegs:');
    // console.log(postRegs);
    const filteredPostRegs = postRegs.filter((reg) => {
      if (dayjs(reg.emitDate).isAfter(dayjs(emitDate))) return true;
      return dayjs(reg.createdAt).isAfter(dayjs(createdAt));
    });
    // console.log('filteredPostRegs:');
    // console.log(filteredPostRegs);

    let currentBalance = initialAccountBalance;
    await Promise.all(filteredPostRegs.map(async (reg) => {
      // console.log('postReg:');
      // console.log(reg);
      // console.log('currentBalance init');
      // console.log(currentBalance);

      currentBalance = Number(
        (currentBalance + reg.value).toFixed(2),
      );

      // console.log('currentBalance updating');
      // console.log(currentBalance);
      await registerModel.findByIdAndUpdate(
        reg._id,
        { whereAccountBalance: currentBalance },
        { session },
      );
    }));
  },

  getPreviousRegisterOfAccount: async ({
    userId, whereAccountId, emitDate, notId, createdAt,
  }) => {
    const previousRegs = await registerModel.find(
      {
        userId,
        emitDate: { $lte: emitDate },
        whereAccountId,
        _id: {
          $ne: notId,
        },
      },
      null,
      { sort: { emitDate: -1, createdAt: -1 } },
    );
    // console.log('previousRegs:');
    // console.log(previousRegs);

    const filteredPostRegs = previousRegs.filter((reg) => {
      if (dayjs(reg.emitDate).isBefore(dayjs(emitDate))) {
        return true;
      }
      return dayjs(reg.createdAt).isBefore(dayjs(createdAt));
    });
    // console.log('filteredPostRegs:');
    // console.log(filteredPostRegs);
    return filteredPostRegs[0];
  },
};

module.exports = RegisterServices;
