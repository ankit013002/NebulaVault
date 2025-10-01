"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { IoMdClose } from "react-icons/io";

export default function Breadcrumbs() {
  const router = useRouter();
  const params = useParams() as { path?: string[] };
  const segments = params?.path ?? [];

  return (
    <div className="breadcrumbs text-sm flex gap-2">
      {segments.length > 0 && (
        <button
          onClick={() => router.push("/dashboard")}
          className="btn rounded-full p-0 aspect-square btn-ghost hover:bg-primary"
          aria-label="Reset to root"
        >
          <IoMdClose />
        </button>
      )}
      <ul>
        {segments.map((seg, index) => {
          const href = "/dashboard/" + segments.slice(0, index + 1).join("/");
          return (
            <li
              key={index}
              className="text-md hover:cursor-pointer hover:text-primary"
              onClick={() => router.push(href)}
            >
              {seg}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
