import React from 'react';
import { Spin } from 'antd';

const style = {
  position: 'fixed',
  top: '50%',
  left: '50%',
};

export default function Loading() {
  return (
    <div style={style}>
      <Spin size="large" />
    </div>
  );
}
