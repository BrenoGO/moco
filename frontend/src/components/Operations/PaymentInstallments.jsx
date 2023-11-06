import React from 'react';
import dayjs from 'dayjs';

import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Form, DatePicker, Row, Col,
} from 'antd';

import InputValue from '../InputValue';

import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';

export default function PaymentInstallments({ bills, setBills, setOpValue }) {
  const { locale } = useSelector((state) => state.DefaultsReducer);
  PaymentInstallments.propTypes = {
    bills: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    setBills: PropTypes.func.isRequired,
    setOpValue: PropTypes.func.isRequired,
  };

  function editBillValue(index, value) {
    setBills(bills.map((item, i) => {
      if (index !== i) return item;
      return { ...item, value };
    }));
  }

  function editOnBlur() {
    const sum = bills.reduce((acc, curr) => acc + curr.value, 0);
    setOpValue(sum);
  }

  function editBillDate(index, value) {
    setBills(bills.map((item, i) => {
      if (index !== i) return item;
      return { ...item, date: value?.toDate() };
    }));
  }

  return (
    <div id="divPaymentInstallments">
      {bills.map((bill, index) => (
        <Row key={index} justify="center">
          <Col xs={12} sm={12} md={6} lg={6}>
            <Form.Item
              label={OperMsgs[locale].date}
              initialValue={dayjs(bill.date)}
            >
              <DatePicker
                onChange={(dateValue) => editBillDate(index, dateValue)}
                value={dayjs(bill.date)}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <InputValue
              label={OperMsgs[locale].value}
              value={helper.toNumber(bill.value)}
              onChange={(val) => editBillValue(index, val)}
              onBlur={(val) => editOnBlur(index, val)}
            />
          </Col>
        </Row>
      ))}
    </div>
  );
}
