import React, { useState, useEffect, useCallback } from 'react';

// Main App Component
export default function App() {

  // Component for individual countdown units (days, hours, etc.)
  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center mx-2 sm:mx-4">
      <div className="text-4xl sm:text-6xl font-bold text-gray-800 bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-4 shadow-lg w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
        {String(value).padStart(2, '0')}
      </div>
      <div className="mt-2 text-sm sm:text-lg font-semibold text-white uppercase tracking-wider">
        {label}
      </div>
    </div>
  );

  // Countdown Timer Component
  const CountdownTimer = () => {
    // Set a target launch date.
    // For this example, let's set it to 30 days from the component mount time.
    const [launchDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
    });

    const calculateTimeLeft = useCallback(() => {
      const difference = +launchDate - +new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return timeLeft;
    }, [launchDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
      // Set up a timer to update the countdown every second.
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      // Clean up the interval when the component unmounts.
      return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    return (
      <div className="flex justify-center my-8">
        <TimeUnit value={timeLeft.days || 0} label="Days" />
        <TimeUnit value={timeLeft.hours || 0} label="Hours" />
        <TimeUnit value={timeLeft.minutes || 0} label="Minutes" />
        <TimeUnit value={timeLeft.seconds || 0} label="Seconds" />
      </div>
    );
  };

  // Main Coming Soon Page Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-indigo-600 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-3xl w-full">

        {/* Main Title */}
        <h1 className="text-5xl sm:text-7xl font-bold text-white mb-4 drop-shadow-lg">
          Loan Transaction Page is Coming Soon
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-2xl text-indigo-100 mb-8 max-w-2xl mx-auto drop-shadow-md">
          We're working hard behind the scenes to bring you an exciting new page. Stay tuned for the big reveal!
        </p>

        {/* Countdown Timer */}
        <CountdownTimer />

      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-indigo-200 text-sm">
        &copy; {new Date().getFullYear()} Your Company Name. All Rights Reserved.
      </footer>
    </div>
  );
}
