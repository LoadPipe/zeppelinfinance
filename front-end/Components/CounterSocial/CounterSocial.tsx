import React from "react";

interface CounterSocialProps {
  text: string;
  number: number;
}

const CounterSocial: React.FC<CounterSocialProps> = ({ text, number }) => {
  return (
    <div className="flex items-center flex-col justify-center">
      <p className="text-center text-black text-lg font-extrabold">{number}</p>
      <p className="text-zinc-600 text-xs font-medium">{text}</p>
    </div>
  );
};

export default CounterSocial;
