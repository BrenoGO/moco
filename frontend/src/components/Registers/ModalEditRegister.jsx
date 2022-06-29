import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Form, Modal, Input, DatePicker, Spin, message,
} from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import Select from '../Select';
import InputValue from '../InputValue';
import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { RegistersService } from '../../services/RegistersService';

export default function ModalEditRegister({
  editModalVisible, setEditModalVisible, registerInitData, registers, setRegisters,
}) {
  ModalEditRegister.propTypes = {
    editModalVisible: PropTypes.func.isRequired,
    setEditModalVisible: PropTypes.func.isRequired,
    registerInitData: PropTypes.func.isRequired,
    registers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    setRegisters: PropTypes.func.isRequired,
  };

  const [register, setRegister] = useState({});
  const [loading, setLoading] = useState(false);
  const { locale, defaultAccounts } = useSelector((state) => state.DefaultsReducer);
  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const currentAccounts = helper.organizedAccounts(accounts, defaultAccounts.currentAccounts);

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
      const resp = await RegistersService.update(register);
      if (resp) {
        const index = registers.findIndex((r) => r._id === register._id);
        setRegisters([
          ...registers.slice(0, index),
          register,
          ...registers.slice(index + 1),
        ]);
        message.success('Registro alterado com sucesso');
        window.location.reload();
      }
    } catch (e) {
      message.error('Error ao atualizar registro');
    } finally {
      setLoading(false);
      setEditModalVisible(false);
    }
  }

  function changeEmitDate(value) {
    setRegister({ ...register, emitDate: value });
  }

  function changeFormValue(prop, value) {
    setRegister({
      ...register,
      [prop]: value,
    });
  }

  return (
    <Modal
      visible={editModalVisible}
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
            <InputValue
              value={register?.value || 0}
              onChange={(v) => changeFormValue('value', v)}
            />
            <Form.Item
              label="Data emissão"
              rules={[{ required: true, message: 'É obrigatório' }]}
            >
              <DatePicker
                onChange={changeEmitDate}
                value={register?.emitDate}
                format="DD/MM/YYYY HH:mm:ss"
                showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
              />
            </Form.Item>
            <div id="selectWhereAccount" className="selectAccount">
              <div id="whereAccountsSelectorLabel">{OperMsgs[locale].currAc}</div>
              <Select
                id="whereAccountsSelector"
                value={register?.whereAccountId}
                onChange={(v) => changeFormValue('whereAccountId', v)}
                options={currentAccounts.map((account) => ({
                  value: account.id,
                  disabled: !account.allowValue,
                  label: account.name,
                }))}
              />
            </div>
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
