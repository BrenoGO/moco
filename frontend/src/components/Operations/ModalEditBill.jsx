import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  Form, Modal, DatePicker, Spin, message,
} from 'antd';
import PropTypes from 'prop-types';
import { BillsService } from '../../services/BillsService';

export default function ModalEditBill({
  editModalVisible, setEditModalVisible, bill,
}) {
  ModalEditBill.propTypes = {
    editModalVisible: PropTypes.bool.isRequired,
    setEditModalVisible: PropTypes.func.isRequired,
    bill: PropTypes.shape({}).isRequired,
  };

  const [dueDate, setDueDate] = useState(dayjs(bill.dueDate).startOf('day'));
  const [loading, setLoading] = useState(false);

  function cancelEdit() {
    setEditModalVisible(false);
  }

  async function handleEditBill() {
    setLoading(true);
    try {
      await BillsService.update(bill._id, { dueDate })

      window.location.reload();
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
          </Form>
        )}

    </Modal>
  );
}
