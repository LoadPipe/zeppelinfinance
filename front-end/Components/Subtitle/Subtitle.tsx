import React from "react";

interface SubtitleProps {
  subtitle: string;
  text: string;
}

const Subtitle: React.FC<SubtitleProps> = ({ subtitle, text }) => {
  return (
    <div className="my-2">
      <h2 className="text-black text-lg font-extrabold leading-normal ">
        {subtitle}
      </h2>
      <p className="text-zinc-600 text-sm font-normal leading-[21px]">{text}</p>
    </div>
  );
};

export default Subtitle;
