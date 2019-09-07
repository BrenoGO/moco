import { useState } from 'react';

export default function useHover(styleWhenMouseEnter, styleWhenMouseLeave) {
  const [hover, setHover] = useState(false);
  function onMouseEnter() {
    setHover(true);
  }
  function onMouseLeave() {
    setHover(false);
  }
  const hoverStyle = !hover
    ? styleWhenMouseLeave
    : styleWhenMouseEnter;

  return { hoverStyle, onMouseEnter, onMouseLeave };
}
