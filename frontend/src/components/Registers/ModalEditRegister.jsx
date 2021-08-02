import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Form, Modal, Input, DatePicker,
} from 'antd';
import moment from 'moment';
import Select from '../Select';
import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';

export default function ModalEditRegister({
  editModalVisible, setEditModalVisible, registerInitData,
}) {
  const [register, setRegister] = useState({});
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

  function handleEditReg() {
    console.log('editing....');
    setEditModalVisible(false);
  }

  function changeEmitDate(value) {
    setRegister({ ...register, emitDate: value });
  }

  function setWhereAccountId(whereAccId) {
    console.log('whereAccId:', whereAccId);
  }

  function setWhatAccountId(whatAccId) {
    console.log('whatAccId:', whatAccId);
  }

  console.log(register);
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
      <Form>
        <Form.Item
          label="Descrição"
          rules={[{ required: true, message: 'É obrigatório' }]}
          required
        >
          <Input name="descricao" value={register?.description} />
        </Form.Item>
        <Form.Item
          label="Valor"
          rules={[{ required: true, message: 'É obrigatório' }]}
        >
          <Input value={register?.value} />
        </Form.Item>
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
            onChange={setWhereAccountId}
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
            onChange={setWhatAccountId}
            options={whatAccountsToSelect.map((account) => ({
              value: account.id,
              disabled: !account.allowValue,
              label: account.name,
            }))}
          />
        </div>
      </Form>
    </Modal>
  );
}
