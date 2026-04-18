import DashboardContentSection from "../../_components/DashboardContentSection";
import DashboardTitleSection from "../../_components/DashboardTitleSection";
import React from "react";

const page = () => {
  return (
    <div className="h-full p-10 flex flex-col w-full gap-10">
      <section className="flex w-full justify-between">
        <DashboardTitleSection />
      </section>
      <section className="flex flex-col h-full gap-10">
        <DashboardContentSection />
      </section>
    </div>
  );
};

export default page;
