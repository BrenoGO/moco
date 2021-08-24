import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Form, Input, Button } from 'antd';
import helper from '../../services/helper';

export default function InputValue({
  onChange, value, label, required, requiredMessage,
}) {
  const { locale } = useSelector((state) => state.DefaultsReducer);
  InputValue.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.number.isRequired,
    label: PropTypes.string,
    required: PropTypes.bool,
    requiredMessage: PropTypes.string,
  };

  InputValue.defaultProps = {
    label: 'Valor',
    required: true,
    requiredMessage: 'Valor é obrigatório',
  };

  return (
    <Form.Item
      label={label}
      rules={[{ required, message: requiredMessage }]}
    >
      <Input
        value={helper.currencyFormatter(locale, value)}
        onChange={(e) => onChange(helper.toNumber(e.target.value))}
        suffix={(
          <Button
            onClick={() => onChange(value * -1)}
            style={{
              display: 'flex',
              border: 0,
              padding: 0,
              paddingRight: 10,
              paddingLeft: 10,
              height: 0,
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 20 }}>-</span>
          </Button>
        )}
      />
    </Form.Item>
  );
}
