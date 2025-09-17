import RecentFiles from "@/components/RecentFiles";
import StorageUsage from "@/components/StorageUsage";
import React from "react";

const page = () => {
  return (
    <div className="h-full p-10 flex flex-col w-full gap-5">
      <section className="flex w-full justify-end">
        <button className="btn btn-primary">New</button>
      </section>
      <section className="flex flex-col gap-10">
        <div className="text-5xl font-medium">Dashboard</div>
        <StorageUsage />
      </section>
      <section>
        <RecentFiles />
      </section>
    </div>
  );
};

export default page;
