module.exports = [
  {
    name: 'defaultAccounts',
    data: {
      income: 1,
      expense: 2,
      currentAccounts: 3,
      futurePayments: 4,
      ToPay: 5,
      ToReceive: 6,
      whereAccounts: {
        AtSight: 12, // 12: wallet,
        ToPay: 22,
        ToReceive: 24
      },
      whatAccounts: {
        income: 7,
        expense: 21,
      },
      transferences: {
        to: 13,
        from: 12
      }
    },
  }
];
