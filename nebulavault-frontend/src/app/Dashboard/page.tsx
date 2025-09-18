import RecentFiles from "@/components/RecentFiles";
import StorageUsage from "@/components/StorageUsage";
import React from "react";

const page = () => {
  return (
    <div className="h-full p-10 flex flex-col w-full gap-5">
      <section className="flex w-full justify-end">
        <button className="btn bg-[#181922] border-[#1d1d25] hover:brightness-75">
          New
        </button>
      </section>
      <section className="flex flex-col gap-10">
        <div className="text-5xl font-medium">Dashboard</div>
        <StorageUsage />
      </section>
      <section className="h-full">
        <RecentFiles />
      </section>
    </div>
  );
};

export default page;
