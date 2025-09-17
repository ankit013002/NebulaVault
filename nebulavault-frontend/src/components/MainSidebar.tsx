"use client";

import React, { useState } from "react";
import SideBarTitleSection from "./SideBarTitleSection";
import SideBarMenuOptions from "./SideBarMenuOptions";

const MainSidebar = () => {
  const [pageSelected, setPageSelected] = useState("Dashboard");

  return (
    <div className="flex flex-col items-center gap-5 py-10 p-2 h-full border-2 border-[#15161d]">
      <section className="w-full">
        <SideBarTitleSection />
      </section>
      <section className="w-full">
        <SideBarMenuOptions
          pageSelected={pageSelected}
          setPageSelected={setPageSelected}
        />
      </section>
    </div>
  );
};

export default MainSidebar;
