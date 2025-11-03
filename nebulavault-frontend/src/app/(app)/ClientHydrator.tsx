"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { setUser } from "@/app/features/user/userSlice";

type Props = {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    plan: string;
    quotaBytes: number;
    usedBytes: number;
  } | null;
};

export default function ClientHydrator({ user }: Props) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user, dispatch]);
  return null;
}
