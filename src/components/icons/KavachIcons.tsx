import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  glowColor?: string;
  animated?: boolean;
}

export function CardIcon({ size = 28, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Rect x="2" y="6" width="24" height="16" rx="3" stroke={color} strokeWidth="1.8" fill="none" />
      <Line x1="2" y1="11" x2="26" y2="11" stroke={color} strokeWidth="1.8" />
      <Rect x="5" y="14" width="6" height="4" rx="1" fill={color} opacity="0.5" />
      <Circle cx="21" cy="16" r="3" stroke={color} strokeWidth="1.5" fill="none" />
      <Path
        d="M21 14.5 L21 16 L22 17"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function HeartbeatIcon({ size = 28, color = '#FF5722' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M2 14 L7 14 L10 8 L13 18 L16 11 L18 14 L26 14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MedicineIcon({ size = 28, color = '#22D3EE' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M8 10 Q8 5 14 5 Q20 5 20 10 L20 18 Q20 23 14 23 Q8 23 8 18 Z"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
      />
      <Line x1="8" y1="14" x2="20" y2="14" stroke={color} strokeWidth="1.8" />
      <Path
        d="M8.2 10.5 Q8.5 6 14 6 Q19.5 6 19.8 10.5 L19.8 13.5 L8.2 13.5 Z"
        fill={color}
        opacity="0.25"
      />
      <Line x1="14" y1="17" x2="14" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="12" y1="19" x2="16" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function SOSIcon({ size = 28, color = '#FF1744' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M14 3 L25 8 L25 16 Q25 22 14 26 Q3 22 3 16 L3 8 Z"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
      />
      <Path
        d="M9 14 L11 14 L12.5 10 L14 18 L15.5 12 L17 14 L19 14"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ScanIcon({ size = 28, color = '#C9A227' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M4 10 L4 4 L10 4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M18 4 L24 4 L24 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M24 18 L24 24 L18 24" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M10 24 L4 24 L4 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="14" cy="14" r="2" fill={color} />
      <Line
        x1="8"
        y1="14"
        x2="11"
        y2="14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <Line
        x1="17"
        y1="14"
        x2="20"
        y2="14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </Svg>
  );
}

export function FamilyIcon({ size = 28, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Circle cx="14" cy="8" r="4" stroke={color} strokeWidth="1.8" fill="none" />
      <Path
        d="M6 24 Q6 16 14 16 Q22 16 22 24"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="22" cy="10" r="3" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
      <Path
        d="M17 22 Q17 17 22 17 Q27 17 27 22"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </Svg>
  );
}

export function HomeIcon({ size = 28, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M4 13 L14 4 L24 13"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M6 12 L6 24 L11 24 L11 18 L17 18 L17 24 L22 24 L22 12"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Line
        x1="14"
        y1="10"
        x2="14"
        y2="14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <Line
        x1="12"
        y1="12"
        x2="16"
        y2="12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </Svg>
  );
}

export function NFCIcon({ size = 28, color = '#22D3EE' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M11 7 L11 21 L18 15 L11 7 Z" fill={color} opacity="0.8" />
      <Path
        d="M20 9 Q24 14 20 19"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M22.5 6 Q28 14 22.5 22"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </Svg>
  );
}

export function BloodIcon({ size = 28, color = '#FF1744' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M14 4 Q14 4 7 13 Q7 20 14 22 Q21 20 21 13 Q21 4 14 4 Z"
        stroke={color}
        strokeWidth="1.8"
        fill={color}
        fillOpacity="0.2"
      />
      <Path
        d="M11 12 Q12 9 14 10"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </Svg>
  );
}

export function ReminderIcon({ size = 28, color = '#F59E0B' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M14 4 Q14 4 14 6 Q8 7 8 14 L8 18 L6 20 L22 20 L20 18 L20 14 Q20 7 14 6 Q14 4 14 4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M11.5 20 Q11.5 23 14 23 Q16.5 23 16.5 20"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <Circle cx="20" cy="7" r="3.5" fill={color} />
    </Svg>
  );
}

export function DoctorIcon({ size = 28, color = '#22D3EE' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M8 5 L8 14 Q8 20 14 20 Q20 20 20 14 L20 18"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M6 5 Q6 3 8 3 Q10 3 10 5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="20" cy="20" r="3.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="20" cy="20" r="1.5" fill={color} />
    </Svg>
  );
}

export function SettingsIcon({ size = 28, color = '#FFFFFF' }: IconProps) {
  const teeth = [0, 60, 120, 180, 240, 300];
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Circle cx="14" cy="14" r="4" stroke={color} strokeWidth="1.8" fill="none" />
      {teeth.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 14 + 6 * Math.cos(rad);
        const y1 = 14 + 6 * Math.sin(rad);
        const x2 = 14 + 9 * Math.cos(rad);
        const y2 = 14 + 9 * Math.sin(rad);
        return (
          <Line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}
    </Svg>
  );
}

export function ProfileIcon({ size = 28, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Circle cx="14" cy="10" r="5" stroke={color} strokeWidth="1.8" fill="none" />
      <Path
        d="M5 24 Q5 17 14 17 Q23 17 23 24"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
