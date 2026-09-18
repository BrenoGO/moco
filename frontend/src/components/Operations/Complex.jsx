/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import {
  Form, DatePicker, Row, Col, Select, Input, message, Button, Popconfirm
} from 'antd';

import './operations.css';

import { OperMsgs } from '../../services/Messages';
import { OperationsService } from '../../services/OperationsService';
import helper from '../../services/helper';

import Spinner from '../Spinner';
import MultipleWhatAcc from './MultipleWhatAccs';
import MultiplePayments from './MultiplePayments';

export default function Complex() {
  const history = useHistory();
  const params = useParams();
  const { id } = params;
  const isEditing = useMemo(() => !!id, [id]);

  const { defaultAccounts, locale } = useSelector((state) => state.DefaultsReducer);

  const [opDesc, setOpDesc] = useState('');
  const [opNotes, setOpNotes] = useState('');
  const [editingOperation, setEditingOperation] = useState(null);
  const [emitDate, setEmitDate] = useState(dayjs().startOf('day'));
  const [loading, setLoading] = useState(false);

  const [whatAccounts, setWhatAccounts] = useState([
    {
      id: defaultAccounts?.whatAccounts?.expense || 'temp',
      value: 0,
      description: '',
      notes: '',
    },
  ]);
  const [payments, setPayments] = useState([
    {
      id: defaultAccounts?.whereAccounts?.AtSight || 'temp',
      value: 0,
      type: 'AtSight',
    },
  ]);
  const [whatAccountToSelect, setWhatAccountToSelect] = useState({
    id: defaultAccounts?.expense,
    name: 'expense',
  });

  const [form] = Form.useForm();

  function setInitialState() {
    setEditingOperation(null);
    const emitDate = dayjs().startOf('day');
    setEmitDate(emitDate);
    form.setFieldsValue({ emitDate });
    setWhatAccounts([
        {
          id: defaultAccounts.whatAccounts.expense,
          value: 0,
          description: '',
          notes: '',
        },
      ]);
      setPayments([
        {
          id: defaultAccounts.whereAccounts.AtSight,
          value: 0,
          type: 'AtSight',
          paymentKey: String(helper.random100()),
        },
      ]);
      setWhatAccountToSelect({
        id: defaultAccounts.expense,
        name: 'expense',
      });
  }

  useEffect(() => {
    if (defaultAccounts?.whatAccounts) {
      setInitialState();
    }
  }, [defaultAccounts]);

  useEffect(() => {
    if (!id) {
      setInitialState();
    }
    if (isEditing) {
      // Fetch the operation data by ID and populate the form fields
      OperationsService.retrieve(id)
        .then((operation) => {
          setEditingOperation(operation);
          console.log('retrieved operation');
          console.log(operation);
          
          const firstRegister = operation.registers?.[0];
          // console.log(firstRegister);
          const firstRegisterOpType = firstRegister?.opType;
          const isExpense = firstRegisterOpType.startsWith('expense');
          setAccounts(isExpense ? 'expense' : 'income');
          
          const emitDate = dayjs(operation.emitDate).startOf('day') || dayjs().startOf('day')
          // console.log('emitDate', emitDate);
          setEmitDate(emitDate);
          // needed because I am using the name property in the form field
          form.setFieldsValue({ emitDate });
          setOpDesc(operation.description || '');
          setOpNotes(operation.notes || '');
          setWhatAccounts(operation.registers?.reduce((acc, r) => {
            if (r.whatAccountId) {
              return [
                ...acc,
                {
                  id: r.whatAccountId,
                  value: Math.abs(r.value),
                  description: r.description || '',
                  notes: r.notes || '',
                }
              ]
            }
            return acc;
          }, []));

          const atSightPayments = operation.registers?.reduce((acc, r) => {
            if (r.opType.endsWith('AtSight') && r.whereAccountId) {
              const signal = r.opType.startsWith('expense') ? -1 : 1;
              return [
                ...acc,
                {
                  type: 'AtSight',
                  id: r.whereAccountId,
                  value: signal * r.value,
                }
              ]
            }
            return acc;
          }, []) || [];

          operation.bills.sort((a, b) => a.installment && b.installment ? +a.installment.substr(0,1) - +b.installment.substr(0,1) : 0);
          console.log('operation.bills sorted', operation.bills);

          const payments = operation.bills?.reduce((acc, b) => {
            const { paymentKey, whereAccount } = b;
            let existingPayment;
            if (paymentKey) {
              existingPayment = acc.find((p) => p.paymentKey === paymentKey);
            } else {
              existingPayment = acc.find((p) => p.id === whereAccount);
            }

            console.log('existingPayment', existingPayment, b);

            if (existingPayment) {
              return acc.map((p) => {
                if (
                  (p.paymentKey && p.paymentKey === existingPayment.paymentKey)
                  || (!p.paymentKey && p.id === existingPayment.id)
                ) {
                  return {
                    ...p,
                    value: p.value + b.value,
                    bills: [...(p.bills || []), { date: new Date(b.dueDate), value: b.value }],
                  };
                }
                return p;
              });
            }

            console.log('new payment', acc, b);

            return [...acc, {
              bills: [{ date: new Date(b.dueDate), value: b.value }],
              type: b.type,
              value: b.value,
              id: b.whereAccount,
              paymentKey: b.paymentKey,
            }]
          }, atSightPayments) || [];

          setPayments(payments);
        })
        .catch((err) => {
          console.error('Error fetching operation:', err);
          message.error(`Erro ao buscar operação! ${err.message || 'Tente novamente.'}`);
        });
    }
  }, [id, isEditing]);

  const sumWhatAccounts = useMemo(
    () => whatAccounts.reduce((ac, current) => ac + current.value, 0),
    [whatAccounts]
  );
  const sumPayments = useMemo(
    () => payments.reduce((ac, current) => ac + current.value, 0),
    [payments]
  );

  function setAccounts(type) {
    if (type === 'expense') {
      setWhatAccountToSelect({ id: defaultAccounts[type], name: 'expense' });
      setPayments(
        payments.map((item) => {
          if (item.type === 'ToPay' || item.type === 'AtSight') return item;
          return { ...item, type: 'ToPay' };
        }),
      );
    } else {
      setWhatAccountToSelect({ id: defaultAccounts[type], name: 'income' });
      setPayments(
        payments.map((item) => {
          if (item.type === 'ToReceive' || item.type === 'AtSight') return item;
          return { ...item, type: 'ToReceive' };
        }),
      );
    }
  }

  function runExtraValueChangedActions(_index, _value, sum) {
    setPayments([
      {
        ...payments[0],
        value: sum,
      },
    ]);
  }

  function reSetState() {
    setWhatAccounts([
      {
        id: defaultAccounts.whatAccounts.expense,
        value: 0,
        description: '',
        notes: '',
      },
    ]);
    setPayments([
      {
        id: defaultAccounts.whereAccounts.AtSight,
        value: 0,
        type: 'AtSight',
        paymentKey: String(helper.random100()),
      },
    ]);
    setWhatAccountToSelect({ id: defaultAccounts.expense, name: 'expense' });
    setEmitDate(new Date());
    setOpDesc('');
    setOpNotes('');
  }

  async function submit() {
    if (sumWhatAccounts === 0) return alert('value is 0!');
    if (sumWhatAccounts.toFixed(2) !== sumPayments.toFixed(2)) {
      return alert('A soma de gastos/receitas deve ser igual a soma de pagamentos');
    }

    setLoading(true);
    const opType = whatAccountToSelect.name;

    try {
      if (isEditing) {
        await OperationsService.editOperation(editingOperation._id, {
          emitDate,
          opType,
          opDesc,
          opNotes,
          whatAccounts,
          payments,
        });
      } else {
        await OperationsService.storeComplexOperation({
          emitDate,
          opType,
          opDesc,
          opNotes,
          whatAccounts,
          payments,
        });
      }

      reSetState();

      if (isEditing) {
        history.push(`${process.env.PUBLIC_URL}/Operations`);
      }
    } catch (err) {
      console.log('error trying to submit complex operation');
      console.log(err);
      message.error(`Erro! ${err.message || 'Ocorreu um error desconhecido! Tente novamente. Se persistir entre em contato com suporte'}`);
    } finally {
      setLoading(false);
    }
  }

  async function submitDelete() {
    setLoading(true);
    const opType = whatAccountToSelect.name;

    try {
      await OperationsService.delete(editingOperation._id);

      reSetState();

      if (isEditing) {
        history.push(`${process.env.PUBLIC_URL}/Operations`);
      }
    } catch (err) {
      console.log('error trying to delete operation');
      console.log(err);
      message.error(`Erro! ${err.message || 'Ocorreu um error desconhecido! Tente novamente. Se persistir entre em contato com suporte'}`);
    } finally {
      setLoading(false);
    }
  }

  // console.log('payments', payments);
  // console.log('editingOperation', editingOperation);

  const hasAtSightPayment = useMemo(() => editingOperation?.registers?.some((r) => r.opType.endsWith('AtSight') && r.whereAccountId), [editingOperation]);
  const hasPaidBill = useMemo(() => editingOperation?.bills?.some((b) => !!b.paymentDate), [editingOperation]);

  return (
    <Form
      layout="vertical"
      form={form}
    >
      {loading && <Spinner />}
      {isEditing && <h2>Editando operação</h2>}
      <Row gutter={16}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].expOrInc}
            name="expenseOrIncome"
            initialValue={whatAccountToSelect.name}
          >
            <Select
              value={whatAccountToSelect.name}
              onChange={setAccounts}
            >
              <Select.Option value="expense">{OperMsgs[locale].expense}</Select.Option>
              <Select.Option value="income">{OperMsgs[locale].income}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].emitDate}
            name="emitDate"
            initialValue={emitDate}
            rules={[{ required: true, message: 'Data de emissão é obrigatório!' }]}
          >
            <DatePicker
              onChange={setEmitDate}
              format="DD/MM/YYYY"
              showNow
              changeOnBlur
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].desc}
          >
            <Input
              value={opDesc}
              onChange={(e) => setOpDesc(e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].notes}
          >
            <Input
              value={opNotes}
              onChange={(e) => setOpNotes(e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>
      <MultipleWhatAcc
        setWhatAccounts={setWhatAccounts}
        whatAccounts={whatAccounts}
        runExtraValueChangedActions={runExtraValueChangedActions}
        whatAccountToSelect={whatAccountToSelect}
      />
      <MultiplePayments
        payments={payments}
        setPayments={setPayments}
        whatAccounts={whatAccounts}
        whatAccountToSelect={whatAccountToSelect}
      />
      {!hasPaidBill ? (
        <div id="divButRegister">
          {isEditing && (
            <Popconfirm
              title="Deletar a operação"
              description={`Tem certeza que deseja deletar esta operação?${hasAtSightPayment ? ' ATENÇÃO: A operação sendo deletada possui pagamentos a vista, que serão estornados.' : ''}`}
              onConfirm={submitDelete}
              okText="Yes"
              cancelText="No"
              className="mr-4"
            >
              <Button danger>
                {OperMsgs[locale].deleteBut}
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
              title={`${isEditing ? 'Editar' : 'Criar'} a operação`}
              description={`Tem certeza que deseja ${isEditing ? 'editar' : 'criar'} esta operação?${hasAtSightPayment ? ' ATENÇÃO: A operação sendo editada possui pagamentos a vista, que podem ser estornados junto com a operação.' : ''}`}
              onConfirm={submit}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary">
                {isEditing ? OperMsgs[locale].editBut : OperMsgs[locale].regBut}
              </Button>
            </Popconfirm>
        </div>
      ) : (
        <div>
          <p style={{ color: 'red' }}>A operação possui pagamentos confirmados, então AINDA não é possível deletar ou editar a operação.</p>
          <p style={{ color: 'red' }}>O sistema passará a ter essa opção estornando o pagamento em breve.</p>
        </div>
      )}
    </Form>
  );
}
