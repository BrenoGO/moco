import React from 'react';

const styleBackDrop = {
  zIndex: 8,
  opacity: '70%',
  position: 'absolute',
  backgroundColor: 'white',
  width: '100%',
  height: '100%'
};

const styleLoading = {
  zIndex: 9,
  position: 'absolute',
  top: '50%',
  left: '50%'
};

export default function Spinner() {
  return (
    <>
      <div style={styleBackDrop} />
      <div className="spinner-border" role="status" style={styleLoading}>
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );
}
