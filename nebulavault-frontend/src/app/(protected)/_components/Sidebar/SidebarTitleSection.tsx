import React from "react";

const SideBarTitleSection = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute w-full h-full rounded-full bg-[#06b6d4] blur-xl opacity-60 animate-pulse"></div>
        <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_10px_5px_#06b6d4] animate-[pulse_5s_ease-in-out_infinite]"></div>
      </div>
      <div className="font-black text-2xl">NEBULA VAULT</div>
    </div>
  );
};

export default SideBarTitleSection;
