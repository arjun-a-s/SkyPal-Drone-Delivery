// FILE: app/DroneLogo.tsx
import React from 'react';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function DroneLogo({ width = 100, height = 100, color = "white" }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" fill="none">
      <G transform="rotate(-15, 50, 50)"> 
        {/* The 4 Rotors */}
        <Circle cx="75" cy="25" r="14" stroke={color} strokeWidth="6" />
        <Circle cx="25" cy="25" r="14" stroke={color} strokeWidth="6" />
        <Circle cx="75" cy="75" r="14" stroke={color} strokeWidth="6" />
        <Circle cx="25" cy="75" r="14" stroke={color} strokeWidth="6" />
        {/* The Body Cross */}
        <Path d="M35 35 L65 65 M65 35 L35 65" stroke={color} strokeWidth="8" strokeLinecap="round" />
        <Circle cx="50" cy="50" r="8" fill={color} />
      </G>
    </Svg>
  );
}