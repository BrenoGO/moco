import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Form, Modal, Input, Spin, message,
} from 'antd';
import PropTypes from 'prop-types';
import Select from '../Select';
import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { RegistersService } from '../../services/RegistersService';

export default function ModalEditWhatInRegister({
  editModalVisible, setEditModalVisible, registerInitData, registers, setRegisters,
}) {
  ModalEditWhatInRegister.propTypes = {
    editModalVisible: PropTypes.bool.isRequired,
    setEditModalVisible: PropTypes.func.isRequired,
    registerInitData: PropTypes.shape({}),
    registers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    setRegisters: PropTypes.func.isRequired,
  };
  ModalEditWhatInRegister.defaultProps = {
    registerInitData: {},
  };

  const [register, setRegister] = useState({});
  const [loading, setLoading] = useState(false);
  const { locale, defaultAccounts } = useSelector((state) => state.DefaultsReducer);
  const accounts = useSelector((state) => state.AccountsReducer.accounts);

  const type = register?.opType?.match('expense') ? 'expense' : 'income';
  const whatAccountsToSelect = helper.organizedAccounts(
    accounts, defaultAccounts[type],
  );
  useEffect(() => {
    setRegister(registerInitData);
  }, [registerInitData]);

  function cancelEditReg() {
    setEditModalVisible(false);
  }

  async function handleEditReg() {
    setLoading(true);
    try {
      const resp = await RegistersService.updateOnly(register._id, {
        description: register.description,
        whatAccountId: register.whatAccountId,
      });
      if (resp) {
        const index = registers.findIndex((r) => r._id === register._id);
        setRegisters([
          ...registers.slice(0, index),
          register,
          ...registers.slice(index + 1),
        ]);
        message.success('Registro alterado com sucesso');
        setEditModalVisible(false);
      }
    } catch (e) {
      console.log(e);
      message.error('Error ao atualizar registro');
    } finally {
      setLoading(false);
    }
  }

  function changeFormValue(prop, value) {
    setRegister({
      ...register,
      [prop]: value,
    });
  }

  return (
    <Modal
      open={editModalVisible}
      title="Edição de registro"
      onCancel={cancelEditReg}
      onOk={handleEditReg}
      closable={false}
      okText="Editar"
      cancelText="Cancelar"
    >
      {loading
        ? (<Spin />)
        : (
          <Form>
            <Form.Item
              label="Descrição"
              rules={[{ required: true, message: 'É obrigatório' }]}
              required
            >
              <Input
                name="descricao"
                onChange={(e) => changeFormValue('description', e.target.value)}
                value={register?.description}
              />
            </Form.Item>

            <div id="selectWhatAccount" className="selectAccount">
              <div id="whatAccountSelectorLabel">{OperMsgs[locale].whatAc}</div>
              <Select
                id="whatAccountSelector"
                value={register?.whatAccountId}
                onChange={(v) => changeFormValue('whatAccountId', v)}
                options={whatAccountsToSelect.map((account) => ({
                  value: account.id,
                  disabled: !account.allowValue,
                  label: account.name,
                }))}
              />
            </div>
          </Form>
        )}

    </Modal>
  );
}
