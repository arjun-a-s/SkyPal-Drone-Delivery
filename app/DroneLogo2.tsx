// FILE: app/DroneLogo.tsx
import React from 'react';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Circle, Line, Rect } from 'react-native-svg';

export default function DroneLogo({ width = 100, height = 100 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#f0f0f0" stopOpacity="1" />
          <Stop offset="50%" stopColor="#d0d0d0" stopOpacity="1" />
          <Stop offset="100%" stopColor="#a8a8a8" stopOpacity="1" />
        </LinearGradient>
        <RadialGradient id="silverMetallic" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <Stop offset="50%" stopColor="#c0c0c0" stopOpacity="1" />
          <Stop offset="100%" stopColor="#8a8a8a" stopOpacity="1" />
        </RadialGradient>
      </Defs>

      {/* Propellers */}
      <Circle cx="20" cy="20" r="12" stroke="url(#silverGradient)" strokeWidth="2.5" fill="none" />
      <Circle cx="80" cy="20" r="12" stroke="url(#silverGradient)" strokeWidth="2.5" fill="none" />
      <Circle cx="20" cy="80" r="12" stroke="url(#silverGradient)" strokeWidth="2.5" fill="none" />
      <Circle cx="80" cy="80" r="12" stroke="url(#silverGradient)" strokeWidth="2.5" fill="none" />

      {/* Arms */}
      <Line x1="32" y1="32" x2="42" y2="42" stroke="url(#silverGradient)" strokeWidth="3.5" />
      <Line x1="68" y1="32" x2="58" y2="42" stroke="url(#silverGradient)" strokeWidth="3.5" />
      <Line x1="32" y1="68" x2="42" y2="58" stroke="url(#silverGradient)" strokeWidth="3.5" />
      <Line x1="68" y1="68" x2="58" y2="58" stroke="url(#silverGradient)" strokeWidth="3.5" />

      {/* Central body */}
      <Rect x="40" y="40" width="20" height="20" fill="url(#silverMetallic)" rx="4" stroke="url(#silverGradient)" strokeWidth="1.5" />

      {/* Package underneath */}
      <Rect x="44" y="58" width="12" height="10" fill="url(#silverMetallic)" opacity="0.9" rx="2" stroke="url(#silverGradient)" strokeWidth="1" />
    </Svg>
  );
} 