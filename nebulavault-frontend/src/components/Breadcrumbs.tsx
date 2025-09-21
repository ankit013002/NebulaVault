"use client";

import React, { useEffect, useState } from "react";

interface BreadcrumbsProps {
  path: string;
}

const Breadcrumbs = ({ path }: BreadcrumbsProps) => {
  const [subpaths, setSubPaths] = useState<string[]>([]);

  useEffect(() => {
    console.log(path);
  }, [path]);

  return (
    <div className="breadcrumbs text-sm">
      <ul>
        <li>
          <a>Home</a>
        </li>
        <li>
          <a>Documents</a>
        </li>
        <li>Add Document</li>
      </ul>
    </div>
  );
};

export default Breadcrumbs;
