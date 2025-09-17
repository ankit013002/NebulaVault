import { ReactNode } from "react";
import {
  FaRegFolder,
  FaFileAlt,
  FaClock,
  FaStar,
  FaTrash,
} from "react-icons/fa";

export type SideBarOptionType = {
  id: number;
  name: string;
  icon?: ReactNode;
};

export const SideBarOptions: SideBarOptionType[] = [
  {
    id: 0,
    name: "Dashboard",
    icon: <FaFileAlt />,
  },
  {
    id: 1,
    name: "Files",
    icon: <FaRegFolder />,
  },
  {
    id: 2,
    name: "Recent",
    icon: <FaClock />,
  },
  {
    id: 3,
    name: "Starred",
    icon: <FaStar />,
  },
  {
    id: 4,
    name: "Trash",
    icon: <FaTrash />,
  },
];
