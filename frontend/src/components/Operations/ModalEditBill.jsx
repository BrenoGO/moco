import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  Form, Modal, DatePicker, Spin, message,
} from 'antd';
import PropTypes from 'prop-types';

import helper from '../../services/helper';
import { BillsService } from '../../services/BillsService';
import { OperMsgs } from '../../services/Messages';

import SelectAccount from '../Select';

export default function ModalEditBill({
  editModalVisible, setEditModalVisible, bill,
}) {
  ModalEditBill.propTypes = {
    editModalVisible: PropTypes.bool.isRequired,
    setEditModalVisible: PropTypes.func.isRequired,
    bill: PropTypes.shape({}).isRequired,
  };

  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const { locale, defaultAccounts } = useSelector((state) => (state.DefaultsReducer));
  const whereAccountsToSelect = helper.organizedAccounts(accounts, defaultAccounts.ToPay)

  const [loading, setLoading] = useState(false);

  const initialDueDate = dayjs(bill.dueDate).startOf('day');

  const [dueDate, setDueDate] = useState(initialDueDate);
  const [whereAccountId, setWhereAccountId] = useState(bill.whereAccount);

  function cancelEdit() {
    setEditModalVisible(false);
  }

  async function handleEditBill() {
    setLoading(true);
    try {
      const objToUpdate = {};

      if (dayjs(dueDate).startOf('day').toISOString() !== initialDueDate.toISOString()) {
        objToUpdate.dueDate = dueDate;
      }

      if (whereAccountId !== bill.whereAccount) {
        objToUpdate.whereAccount = whereAccountId;
      }

      if (Object.keys(objToUpdate).length) {
        await BillsService.update(bill._id, objToUpdate)

        window.location.reload();
        return;
      }
      console.log('Nothing to update');
      setEditModalVisible(false);
    } catch (e) {
      console.log(e);
      message.error('Error ao atualizar conta, se persistir entre em contato com suporte');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={editModalVisible}
      title="Edição de conta"
      onCancel={cancelEdit}
      onOk={handleEditBill}
      closable={false}
      okText="Editar"
      cancelText="Cancelar"
    >
      {loading
        ? (<Spin />)
        : (
          <Form>
            <Form.Item
              label="Data de vencimento"
              rules={[{ required: true, message: 'É obrigatório' }]}
            >
              <DatePicker
                onChange={setDueDate}
                value={dueDate}
                format="DD/MM/YYYY"
              />
            </Form.Item>
            <Form.Item
              label={OperMsgs[locale].paymentOptions}
            >
              <SelectAccount
                id="whereAccountsSelector"
                value={whereAccountId}
                onChange={setWhereAccountId}
                options={whereAccountsToSelect.map((account) => ({
                  value: account.id,
                  disabled: !account.allowValue,
                  label: account.name,
                }))}
              />
            </Form.Item>
          </Form>
        )}

    </Modal>
  );
}
