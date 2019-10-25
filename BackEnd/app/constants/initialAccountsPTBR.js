module.exports = [
  {
    allowValue: false,
    name: 'Entradas',
    id: 1
  },
  {
    allowValue: false,
    name: 'Gastos',
    id: 2
  },
  {
    allowValue: false,
    name: 'Contas Correntes',
    id: 3
  },
  {
    allowValue: false,
    name: 'Formas de Pagamento',
    id: 4
  },
  {
    allowValue: false,
    name: 'A Pagar',
    parents: [4],
    id: 5
  },
  {
    allowValue: false,
    name: 'A Receber',
    parents: [4],
    id: 6
  },
  {
    allowValue: true,
    name: 'Salário',
    parents: [1],
    id: 7
  },
  {
    allowValue: true,
    name: 'Outras',
    parents: [1],
    id: 8
  },
  {
    allowValue: false,
    name: 'Fixos',
    parents: [2],
    id: 9
  },
  {
    allowValue: false,
    name: 'Carro',
    parents: [2],
    id: 10
  },
  {
    allowValue: false,
    name: 'Diversão',
    parents: [2],
    id: 11
  },
  {
    allowValue: true,
    name: 'Carteira',
    parents: [3],
    id: 12
  },
  {
    allowValue: true,
    name: 'Banco',
    parents: [3],
    id: 13
  },
  {
    allowValue: false,
    name: 'Investimentos',
    parents: [3],
    id: 14
  },
  {
    allowValue: true,
    name: 'Eletricidade',
    parents: [2, 9],
    id: 15
  },
  {
    allowValue: true,
    name: 'Condomínio',
    parents: [2, 9],
    id: 16
  },
  {
    allowValue: true,
    name: 'Combustível',
    parents: [2, 10],
    id: 17
  },
  {
    allowValue: true,
    name: 'Manutenção',
    parents: [2, 10],
    id: 18
  },
  {
    allowValue: true,
    name: 'Viagens',
    parents: [2, 11],
    id: 19
  },
  {
    allowValue: true,
    name: 'Poupança',
    parents: [3, 14],
    id: 20
  },
  {
    allowValue: true,
    name: 'Mercado',
    parents: [2, 9],
    id: 21
  },
  {
    allowValue: true,
    name: 'Cartão de Crédito',
    parents: [4, 5],
    id: 22
  },
  {
    allowValue: true,
    name: 'Contas',
    parents: [4, 5],
    id: 23
  },
  {
    allowValue: true,
    name: 'Depósito',
    parents: [4, 6],
    id: 24
  },
  {
    allowValue: true,
    name: 'Contas',
    parents: [4, 6],
    id: 25
  },
];
//  1: incomes
//  2: expenses
//  3: current accounts
//  4: future payments
//  5: to pay
//  6: to receive
