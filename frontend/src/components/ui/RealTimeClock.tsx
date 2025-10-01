'use client';

import { useState, useEffect } from 'react';

interface RealTimeClockProps {
  format?: 'time-only' | 'full';
  className?: string;
}

export default function RealTimeClock({ format = 'time-only', className = '' }: RealTimeClockProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted flag to prevent hydration mismatch
    setMounted(true);

    // Update time immediately
    setCurrentTime(new Date());

    // Set up interval to update every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || !currentTime) {
    return (
      <div className={className}>
        <p className="text-xl font-semibold">--:--</p>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    if (format === 'full') {
      return {
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        date: date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    }

    return {
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      date: null
    };
  };

  const { time, date } = formatTime(currentTime);

  return (
    <div className={className}>
      <p className="text-xl font-semibold">{time}</p>
      {date && (
        <p className="text-sm opacity-80">{date}</p>
      )}
    </div>
  );
}