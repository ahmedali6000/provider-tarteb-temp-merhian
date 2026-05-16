import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

const UserIcon = ({ size = 24, color = "#798186" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={1.5} />
    <Path
      d="M4 20C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 20"
      stroke={color}
      strokeWidth={1.5}
    />
  </Svg>
);

export default UserIcon;