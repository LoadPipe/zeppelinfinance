import React from "react";

interface HeadingProps {
  text: string;
}

const Heading: React.FC<HeadingProps> = ({ text }) => {
  return (
    <div className="text-black text-[42px] font-extrabold">
      <h1>{text}</h1>
    </div>
  );
};

export default Heading;
