const accountsModel = require('../models/accountModel');
const registerModel = require('../models/registerModel');

module.exports = {
  incomeOrExpense: async (req, res) => {
    const {
      opTypePrefix, whatAccountId, emitDate, searchDesc,
    } = req.body;
    const objSearch = {
      userId: req.user._id, whatAccountId, emitDate, opType: { $regex: opTypePrefix },
    };

    if (!objSearch.whatAccountId) {
      // sempre precisa de uma whatAccountId para relatório de despesa ou receita
      objSearch.whatAccountId = {
        $ne: null,
      };
    }
    if (searchDesc) {
      objSearch.description = {
        $regex: searchDesc, $options: 'i',
      };
    }

    const registers = await registerModel.find(
      objSearch,
      null,
      { sort: { emitDate: -1, createdAt: -1 } },
    );

    res.json(registers);
  },
  // Find todas as contas correntes
  // para cada uma:
  //   pegar todos registros do período
  //   se nenhum encontrado buscar último registro: initial e final saldo é o mesmo
  //   se encontrado: agrupar por tipo de registro
  cashFlow: async (req, res) => {
    const { initDate, endDate } = req.query;
    const userId = req.user._id;

    const accounts = await accountsModel.find({ userId, parents: 3 });

    const cashFlowReport = (await Promise.all(accounts.map(async (account) => {
      // console.log('account');
      // console.log(account);
      const registersInPeriod = await registerModel.find(
        {
          userId,
          whereAccountId: account.id,
          emitDate: {
            $gt: initDate,
            $lt: endDate,
          },
          whereAccountBalance: { $ne: null },
        },
        null,
        { sort: { emitDate: 1 } },
      );
      if (!registersInPeriod.length) {
        const lastRegister = await registerModel.find(
          {
            userId,
            whereAccountId: account.id,
          },
          null,
          { sort: { emitDate: -1, createdAt: -1 }, limit: 1 },
        );

        // console.log(`lastRegister for ${account.name}`);
        // console.log(lastRegister);

        return {
          id: account.id,
          accountName: account.name,
          initialBalance: lastRegister[0]?.whereAccountBalance || 0,
          incomeAtSight: 0,
          expenseAtSight: 0,
          payment: 0,
          transference: 0,
          finalBalance: lastRegister[0]?.whereAccountBalance || 0,
        };
      }

      const initialValue = registersInPeriod[0].whereAccountBalance - registersInPeriod[0].value;

      // if (!initialValue) {
      //   console.log('......no initial value... registersInPeriod[0].............');
      //   console.log(account);
      //   console.log(registersInPeriod[0]);
      // }
      const summary = registersInPeriod.reduce((acc, curr) => {
        const obj = {
          ...acc,
          [curr.opType]: acc[curr.opType] + curr.value,
          finalBalance: acc.finalBalance + curr.value,
        };
        // if (account.name === 'Banco Inter') {
        //   console.log('--------Banco Inter');
        //   console.log(acc);
        //   console.log(curr);
        //   console.log(obj);
        // }
        return obj;
      }, {
        id: account.id,
        accountName: account.name,
        initialBalance: initialValue || 0,
        incomeAtSight: 0,
        expenseAtSight: 0,
        payment: 0,
        transference: 0,
        finalBalance: initialValue || 0,
      });

      // console.log(`summary for ${account.name}`);
      // console.log(summary);
      return summary;
    }))).sort((a, b) => b.finalBalance - a.finalBalance);

    return res.json(cashFlowReport);
  },
  general: async (req, res) => {
    console.log('fetching general report...');
    try {
      const { initDate, endDate } = req.query;
      const userId = req.user._id;
  
      const registers = await registerModel.find(
        {
          userId,
          whatAccountId: { $exists: true },
          emitDate: {
            $gt: initDate,
            $lt: endDate
          }
        },
        null,
        { sort: { emitDate: -1, createdAt: -1 } },
      );
  
      res.json(registers.map((r) => ({
        opType: r.opType,
        whatAccountId: r.whatAccountId,
        whereAccountId: r.whereAccountId,
        value: r.value,
      })));
    } catch (err) {
      console.error('error in general report');
      console.error(err);
      res.status(500).json({ err });
    }
  }
};
