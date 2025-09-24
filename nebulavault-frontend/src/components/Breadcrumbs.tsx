"use client";

import {
  resetPath,
  selectCurrentPath,
  setPath,
} from "@/app/features/currentPath/currentPathSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

const Breadcrumbs = () => {
  const [subpaths, setSubPaths] = useState<string[]>([]);

  const dispatch = useAppDispatch();
  const currPath = useAppSelector(selectCurrentPath);

  useEffect(() => {
    if (currPath.length > 0) {
      setSubPaths(currPath.split("/"));
    }
  }, [currPath]);

  const denormalize = (path: string[]) => {
    let denormalizedPath = "";
    path.forEach((subpath) => {
      denormalizedPath += subpath + "/";
    });
    return denormalizedPath;
  };

  const handlePathRedirect = (crumb: string, index: number) => {
    const newPathArray = subpaths.slice(0, index + 1);
    const newPath = denormalize(newPathArray);
    dispatch(setPath(newPath));
  };

  return (
    <div className="breadcrumbs text-sm flex gap-2">
      {currPath.length > 0 && (
        <button
          onClick={() => dispatch(resetPath())}
          className="btn rounded-full p-0 aspect-square btn-ghost hover:bg-primary"
        >
          <IoMdClose />
        </button>
      )}
      <ul>
        {subpaths.map((crumb, index) => {
          return (
            <li
              className="text-md hover:cursor-pointer hover:text-primary"
              onClick={() => handlePathRedirect(crumb, index)}
              key={index}
            >
              {crumb}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Breadcrumbs;
