"use client";

import { SideBarOptionType } from "@/utils/SideBarOptions";
import React, { useEffect, useState } from "react";

interface SidebarMenuOptionProps {
  option: SideBarOptionType;
  pageSelected: string;
  setPageSelected: React.Dispatch<React.SetStateAction<string>>;
}

const SideBarMenuOption = ({
  option,
  pageSelected,
  setPageSelected,
}: SidebarMenuOptionProps) => {
  const [isOptionSelected, setIsOptionSelected] = useState(false);

  useEffect(() => {
    setIsOptionSelected(pageSelected === option.name);
  }, [pageSelected]);

  return (
    <>
      <label
        className={`join-item btn btn-ghost w-full justify-start gap-3 border-r-0 border-y-0  ${
          isOptionSelected
            ? "bg-[#181c23] border-l-accent"
            : "bg-transparent border-l-0"
        }`}
      >
        <input
          type="radio"
          name="options"
          value={option.name}
          className="hidden"
          checked={isOptionSelected}
          onChange={() => setPageSelected(option.name)}
        />
        {option.icon && <span className="text-lg">{option.icon}</span>}
        <span>{option.name}</span>
      </label>
    </>
  );
};

export default SideBarMenuOption;
