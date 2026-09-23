import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

interface Options {
  onShake: () => void;
  threshold?: number;
  shakeCount?: number;
  windowMs?: number;
  enabled?: boolean;
}

export function useShakeDetection({
  onShake,
  threshold = 2.0,
  shakeCount = 3,
  windowMs = 1500,
  enabled = true,
}: Options) {
  const shakes = useRef<number[]>([]);
  const lastShake = useRef(0);

  useEffect(() => {
    if (!enabled) return undefined;

    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (magnitude > threshold && now - lastShake.current > 200) {
        lastShake.current = now;
        shakes.current = [...shakes.current.filter((t) => now - t < windowMs), now];

        if (shakes.current.length >= shakeCount) {
          shakes.current = [];
          onShake();
        }
      }
    });

    return () => sub.remove();
  }, [enabled, onShake, shakeCount, threshold, windowMs]);
}
