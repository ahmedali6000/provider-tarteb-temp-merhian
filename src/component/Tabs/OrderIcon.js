import React from "react";
import Svg, { Path } from "react-native-svg";

const OrderIcon = ({ size = 24, color = "#798186" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 6H16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M8 12H16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M8 18H12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

export default OrderIcon;