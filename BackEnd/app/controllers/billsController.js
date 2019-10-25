const billModel = require('../models/billModel');

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
      paymentDate: { $exists: false }
    }, {}, { sort: { dueDate: 1 } });
    res.json(bills);
  },
  all: async (req, res) => {
    const bills = await billModel.find({ userId: req.user._id });
    res.json(bills);
  },
  store: async (req, res) => {
    const bills = await billModel.create(
      req.body.map(bill => ({ ...bill, userId: req.user._id }))
    );
    res.json(bills);
  },
  pay: async (req, res) => {
    const { id } = req.params;
    const { paymentDate } = req.body;
    const bill = await billModel.findByIdAndUpdate(id, { paymentDate }, { new: true });
    res.json(bill);
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
          err
        });
      }
      return res.send({ ok: 'All Clear' });
    });
  }
};