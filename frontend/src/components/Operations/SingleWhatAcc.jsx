import React from 'react';

import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Form, Row, Col, Input, Card
} from 'antd';
import Select from '../Select';

import helper from '../../services/helper';
import { OperMsgs } from '../../services/Messages';
import InputValue from '../InputValue';

export default function SingleWhatAcc({
  setWhatAccounts, whatAccounts, whatAccount, index, whatAccountToSelect, runExtraValueChangedActions
}) {
  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const { locale } = useSelector((state) => state.DefaultsReducer);

  const whatAccountsToSelect = helper.organizedAccounts(accounts, whatAccountToSelect.id);

  SingleWhatAcc.propTypes = {
    setWhatAccounts: PropTypes.func.isRequired,
    whatAccounts: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    whatAccount: PropTypes.shape({}).isRequired,
    index: PropTypes.number.isRequired,
    whatAccountToSelect: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }).isRequired,
    runExtraValueChangedActions: PropTypes.func,
  };
  SingleWhatAcc.defaultProps = {
    runExtraValueChangedActions: undefined,
  };

  function handleWhatAccountsIdChange(id) {
    setWhatAccounts(
      whatAccounts.map((item, i) => {
        if (index !== i) return item;
        return { ...item, id };
      }),
    );
  }

  function handleWhatDescChange(description) {
    setWhatAccounts(
      whatAccounts.map((item, i) => {
        if (index !== i) return item;
        return { ...item, description };
      }),
    );
  }

  function handleWhatNotesChange(notes) {
    setWhatAccounts(
      whatAccounts.map((item, i) => {
        if (index !== i) return item;
        return { ...item, notes };
      }),
    );
  }

  function handleCloseWhatAccount() {
    setWhatAccounts([...whatAccounts.slice(0, index), ...whatAccounts.slice(index + 1, whatAccounts.length)]);
  }

  function handleWhatAccountsValueChange(value) {
    const newWhatAccounts = whatAccounts.map((item, i) => {
      if (index !== i) return item;
      return { ...item, value };
    });

    setWhatAccounts(newWhatAccounts);
    if (runExtraValueChangedActions) {
      runExtraValueChangedActions(index, value, newWhatAccounts.reduce((ac, current) => ac + current.value, 0));
    }
  }

  return (
    <Card
      extra={<button className="smallBut" type="button" onClick={handleCloseWhatAccount}>X</button>}
      style={{ marginTop: '3px' }}
      title={
        <Select
          style={{ width: '80%' }}
          id={`whatAccountSelector-${index}`}
          value={whatAccount.id}
          onChange={(id) => handleWhatAccountsIdChange(id)}
          options={whatAccountsToSelect.map((account) => ({
            value: account.id,
            disabled: !account.allowValue,
            label: account.name,
          }))}
        />
      }
    >
      <Row gutter={16}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <InputValue
            label={OperMsgs[locale].value}
            value={whatAccount.value}
            onChange={(v) => handleWhatAccountsValueChange(v)}
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].desc}
          >
            <Input
              value={whatAccount.description}
              onChange={(e) => handleWhatDescChange(e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].notes}
          >
            <Input
              value={whatAccount.notes}
              onChange={(e) => handleWhatNotesChange(e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>

    </Card>
  );
}
