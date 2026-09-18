const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const schema = mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: 'User',
    },
    value: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['ToPay', 'ToReceive'],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    emitDate: {
      type: Date,
      required: true,
    },
    installment: String,
    notes: String,
    whereAccount: {
      type: Number,
      required: true,
    },
    paymentDate: Date,
    operation: {
      type: ObjectId,
      ref: 'Operation',
    },
    /**
     * key para diferenciar pagamentos em uma mesma operacao complexa
     * Suponha você pague uma compra com o mesmo cartão duas vezes, exemplo uma a vista e outra parcelando
     * ou parcelando em 2x e outra em 3x
     * deve ser muito incomum, mas é possível, então para diferenciar os pagamentos de uma mesma operação complexa, cada pagamento terá um paymentKey diferente
     */
    paymentKey: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ userId: 1, type: 1, dueDate: 1, paymentDate: 1 });

module.exports = mongoose.model('Bill', schema);
