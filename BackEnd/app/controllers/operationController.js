const operationModel = require('../models/operationModel');
const billModel = require('../models/billModel');
const registerModel = require('../models/registerModel');

module.exports = {
  index: async (req, res) => {
    const { id } = req.params;
    const operation = await operationModel.findById(id);
    res.json(operation);
  },
  all: async (req, res) => {
    const operations = await operationModel.find();
    res.json(operations);
  },
  store: async (req, res) => {
    req.body.userId = req.user._id;
    const operation = await operationModel.create(req.body);
    if (operation.bills.length > 0) {
      operation.bills.forEach(async (bill) => {
        await billModel.findByIdAndUpdate(bill, { operation: operation._id });
      });
    }
    if (operation.registers.length > 0) {
      operation.registers.forEach(async (register) => {
        await registerModel.findByIdAndUpdate(register, { operation: operation._id });
      });
    }
    res.json(operation);
  },
  delete: async (req, res) => {
    const { id } = req.params;
    await operationModel.findByIdAndDelete(id);
    res.json({ ok: 'deleted' });
  },
  clearAll: (req, res) => {
    operationModel.deleteMany({}, (err) => {
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
