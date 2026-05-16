import React from "react";
import Svg, { Path } from "react-native-svg";

const BundleIcon = ({ size = 24, color = "#798186" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3L4 9L12 15L20 9L12 3Z"
      stroke={color}
      strokeWidth={1.5}
    />
    <Path
      d="M4 15L12 21L20 15"
      stroke={color}
      strokeWidth={1.5}
    />
  </Svg>
);

export default BundleIcon;