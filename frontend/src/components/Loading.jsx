import React from 'react';

const style = {
  position: 'fixed',
  top: '50%',
  left: '50%',
};

export default function Loading() {
  return (
    <div style={style}>
      <span>Loading....</span>
    </div>
  );
}
