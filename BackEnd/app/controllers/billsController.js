const billModel = require('../models/billModel');
const registerModel = require('../models/registerModel');

module.exports = {
  index: async (req, res) => {
    const { id } = req.params;
    const bill = await billModel.findById(id);
    res.json(bill);
  },
  byType: async (req, res) => {
    const { type } = req.params;
    const bills = await billModel.find({
      userId: req.user._id,
      type,
      paymentDate: { $exists: false },
    }, {}, { sort: { dueDate: 1, emitDate: 1 } })
      .populate({ path: 'operation', select: ['description', 'notes', 'registers'] });

    const billsWithRegisters = await Promise.all(bills.map(async (bill) => {
      const registers = await Promise.all(
        bill.operation.registers.map(
          async registerId => registerModel.findById(
            registerId,
            'description whatAccountId whereAccountId value notes',
          ),
        ),
      );

      // if (!registers[0]) {
      //   console.log('\n\n bill with invalid register:');
      //   console.log(bill);
      // }

      return {
        ...bill._doc,
        operation: {
          ...bill._doc.operation._doc,
          registers,
        },
      };
    }));

    res.json(billsWithRegisters);
  },
  all: async (req, res) => {
    const bills = await billModel.find({ userId: req.user._id });
    res.json(bills);
  },
  search: async (req, res) => {
    const objSearch = { userId: req.user._id };
    const keys = Object.keys(req.body);
    keys.forEach((key) => {
      objSearch[key] = req.body[key];
    });
    const bills = await billModel.find(
      objSearch,
      null,
      { sort: { emitDate: -1, updatedAt: -1 } },
    );

    res.json(bills);
  },
  store: async (req, res) => {
    const bills = await billModel.create(
      req.body.map(bill => ({ ...bill, userId: req.user._id })),
    );
    res.json(bills);
  },
  pay: async (req, res) => {
    const { id } = req.params;
    const { paymentDate } = req.body;
    const bill = await billModel.findByIdAndUpdate(id, { paymentDate }, { new: true });
    res.json(bill);
  },
  update: async (req, res) => {
    const { id } = req.params;
    const bill = await billModel.findByIdAndUpdate(id, req.body, { new: true });
    return res.json(bill);
  },
  delete: async (req, res) => {
    const { id } = req.params;
    await billModel.findByIdAndDelete(id);
    res.json({ ok: 'deleted' });
  },
  clearAll: (req, res) => {
    billModel.deleteMany({}, (err) => {
      if (err) {
        return res.send({
          naoOk: 'nao foi removido',
          err,
        });
      }
      return res.send({ ok: 'All Clear' });
    });
  },
};
