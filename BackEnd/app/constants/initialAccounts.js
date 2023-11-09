module.exports = [
  {
    allowValue: false,
    name: 'Incomes',
    id: 1,
  },
  {
    allowValue: false,
    name: 'Expenses',
    id: 2,
  },
  {
    allowValue: false,
    name: 'Current Accounts',
    id: 3,
  },
  {
    allowValue: false,
    name: 'Payment Options',
    id: 4,
  },
  {
    allowValue: false,
    name: 'To Pay',
    parents: [4],
    id: 5,
  },
  {
    allowValue: false,
    name: 'To Receive',
    parents: [4],
    id: 6,
  },
  {
    allowValue: true,
    name: 'Salary',
    parents: [1],
    id: 7,
  },
  {
    allowValue: true,
    name: 'Others',
    parents: [1],
    id: 8,
  },
  {
    allowValue: false,
    name: 'Fixed',
    parents: [2],
    id: 9,
  },
  {
    allowValue: false,
    name: 'Car',
    parents: [2],
    id: 10,
  },
  {
    allowValue: false,
    name: 'Fun!',
    parents: [2],
    id: 11,
  },
  {
    allowValue: true,
    name: 'Wallet',
    parents: [3],
    id: 12,
  },
  {
    allowValue: true,
    name: 'Bank',
    parents: [3],
    id: 13,
  },
  {
    allowValue: false,
    name: 'Investments',
    parents: [3],
    id: 14,
  },
  {
    allowValue: true,
    name: 'Electricity',
    parents: [2, 9],
    id: 15,
  },
  {
    allowValue: true,
    name: 'Condominium',
    parents: [2, 9],
    id: 16,
  },
  {
    allowValue: true,
    name: 'Gas',
    parents: [2, 10],
    id: 17,
  },
  {
    allowValue: true,
    name: 'Maintenance',
    parents: [2, 10],
    id: 18,
  },
  {
    allowValue: true,
    name: 'Trips',
    parents: [2, 11],
    id: 19,
  },
  {
    allowValue: true,
    name: 'Savings',
    parents: [3, 14],
    id: 20,
  },
  {
    allowValue: true,
    name: 'Market',
    parents: [2, 9],
    id: 21,
  },
  {
    allowValue: true,
    name: 'Credit Card',
    parents: [4, 5],
    id: 22,
  },
  {
    allowValue: true,
    name: 'Bill',
    parents: [4, 5],
    id: 23,
  },
  {
    allowValue: true,
    name: 'Deposit',
    parents: [4, 6],
    id: 24,
  },
  {
    allowValue: true,
    name: 'Bill',
    parents: [4, 6],
    id: 25,
  },
];
//  1: incomes
//  2: expenses
//  3: current accounts
//  4: future payments
//  5: to pay
//  6: to receive
