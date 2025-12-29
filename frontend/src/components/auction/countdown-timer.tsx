"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endTime: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function CountdownTimer({ endTime, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    const difference = new Date(endTime).getTime() - new Date().getTime();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    };
  });

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft.total <= 0) {
    return (
      <span className={`font-semibold text-gray-500 ${className}`}>
        Ended
      </span>
    );
  }

  const isUrgent = timeLeft.total < 5 * 60 * 1000;
  const isWarning = timeLeft.total < 30 * 60 * 1000;

  const textColor = isUrgent
    ? "text-red-600"
    : isWarning
    ? "text-orange-600"
    : "text-green-600";

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  const parts = [];
  if (timeLeft.days > 0) {
    parts.push(`${timeLeft.days}g`);
  }
  if (timeLeft.hours > 0 || timeLeft.days > 0) {
    parts.push(`${formatNumber(timeLeft.hours)}h`);
  }
  parts.push(`${formatNumber(timeLeft.minutes)}m`);
  parts.push(`${formatNumber(timeLeft.seconds)}s`);

  return (
    <span className={`font-semibold ${textColor} ${className}`}>
      {parts.join(" ")}
    </span>
  );
}
