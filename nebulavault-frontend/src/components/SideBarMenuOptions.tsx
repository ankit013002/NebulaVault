"use client";

import { SideBarOptions } from "@/utils/SideBarOptions";
import React, { useState } from "react";
import SideBarMenuOption from "./SideBarMenuOption";

const SideBarMenuOptions = () => {
  const [pageSelected, setPageSelected] = useState("");

  return (
    <div className="flex flex-col w-full">
      {SideBarOptions.map((option, index) => (
        <SideBarMenuOption
          key={option.id}
          option={option}
          pageSelected={pageSelected}
          setPageSelected={setPageSelected}
        />
      ))}
    </div>
  );
};

export default SideBarMenuOptions;
