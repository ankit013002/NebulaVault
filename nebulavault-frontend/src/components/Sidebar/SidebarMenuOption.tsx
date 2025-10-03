"use client";

import { SideBarOptionType } from "@/utils/SideBarOptions";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface SidebarMenuOptionProps {
  option: SideBarOptionType;
  pageSelected: string;
  setPageSelected: React.Dispatch<React.SetStateAction<string>>;
}

export default function SideBarMenuOption({
  option,
  pageSelected,
  setPageSelected,
}: SidebarMenuOptionProps) {
  const [isOptionSelected, setIsOptionSelected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsOptionSelected(pageSelected === option.name);
  }, [pageSelected, option.name]);

  const handleSelect = () => {
    setPageSelected(option.name);
    if (option.name === "Dashboard") {
      router.push("/dashboard");
    } else {
      router.push(`/${option.name.toLowerCase()}`);
    }
  };

  return (
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
        onChange={handleSelect}
      />
      {option.icon && <span className="text-lg">{option.icon}</span>}
      <span>{option.name}</span>
    </label>
  );
}
