"use client";

import { useState, useEffect } from 'react';

const CurrentDate: React.FC = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);
    const dayOfMonth = parseInt(parts.find(part => part.type === 'day')?.value || '');
    const dayOfMonthSuffix = getDayOfMonthSuffix(dayOfMonth);
    const formattedDate = `${parts.find(part => part.type === 'hour')?.value}:${parts.find(part => part.type === 'minute')?.value} ${parts.find(part => part.type === 'dayPeriod')?.value}, ${parts.find(part => part.type === 'weekday')?.value}, ${parts.find(part => part.type === 'month')?.value} ${dayOfMonth}${dayOfMonthSuffix} ${parts.find(part => part.type === 'year')?.value}`;
    return formattedDate;
  };

  const getDayOfMonthSuffix = (dayOfMonth: number) => {
		if ([1, 21, 31].includes(dayOfMonth)) {return 'st';}
		else if ([2, 22].includes(dayOfMonth)) {return 'nd';}
		else if ([3, 23].includes(dayOfMonth)) {return 'rd';}
		else {return 'th';}
  };

  return (
    <div className="w-full text-gray-400">
      <p>{formatDate(date)}</p>
    </div>
  );
};

export default CurrentDate;