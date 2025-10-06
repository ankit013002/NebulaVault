"use client";

import Image from "next/image";
import React from "react";
import pfp from "/public/pfp.jpg";
import { logout } from "@/utils/auth/handlers/LogoutHandler";
import { useRouter } from "next/navigation";

type Props = {
  name?: string;
  email?: string;
  usedGb?: number;
  quotaGb?: number;
};

const SideBarAccountSection: React.FC<Props> = ({
  name = "Ankit Patel",
  email = "ankit@example.com",
  usedGb = 23.4,
  quotaGb = 100,
}) => {
  const pct = Math.min(100, Math.round((usedGb / quotaGb) * 100));
  const router = useRouter();

  const onSignOut = async () => {
    const res = await logout();
    if (res) {
      router.replace("/");
      router.refresh();
    } else {
      // TODO: Handle accordingly
      console.log("Couldn't Sign Out");
    }
  };

  return (
    <div className="mt-auto sticky bottom-0 inset-x-0 bg-nv-surface/80 backdrop-blur-md border-t border-nv-border shadow-card px-3 py-3">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-nv-primary/30 to-transparent mb-3" />

      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="bg-gradient-to-r from-nv-primary/35 to-nv-primary2/35 p-[2px] rounded-full shadow-glow-sm">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-nv-surface">
              <Image
                src={pfp}
                alt="Profile picture"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
          </div>
          <span
            className="
              absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full
              bg-success ring-2 ring-nv-surface
            "
            aria-hidden
          />
        </div>

        <div className="min-w-0">
          <div className="font-medium leading-5 text-nv-text truncate">
            {name}
          </div>
          <div className="text-xs text-nv-muted truncate">{email}</div>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            className="btn btn-ghost btn-sm btn-square tooltip text-nv-text hover:text-nv-text/90"
            data-tip="Upload"
            aria-label="Upload"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 16V4M12 4l-4 4M12 4l4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 20h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="dropdown dropdown-top dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-sm btn-square tooltip text-nv-text hover:text-nv-text/90"
              data-tip="Account"
              aria-label="Account menu"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="5" cy="12" r="1.7" />
                <circle cx="12" cy="12" r="1.7" />
                <circle cx="19" cy="12" r="1.7" />
              </svg>
            </button>
            <ul
              tabIndex={0}
              className="
                dropdown-content menu menu-sm z-10 w-56 p-2
                rounded-box bg-nv-surface/95 backdrop-blur-xl shadow-card
                border border-nv-border
              "
            >
              <li className="menu-title px-2 text-nv-muted">Account</li>
              <li>
                <a className="text-nv-text">Profile</a>
              </li>
              <li>
                <a className="text-nv-text">Settings</a>
              </li>
              <li>
                <a className="text-nv-text">Keyboard shortcuts</a>
              </li>
              <li>
                <button className="text-error" onClick={() => onSignOut()}>
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[11px] text-nv-muted">
          <span>
            {usedGb.toFixed(1)} / {quotaGb.toFixed(0)} GB
          </span>
          <span>{pct}%</span>
        </div>

        <div
          className="
            relative h-2 w-full overflow-hidden rounded-full
            bg-nv-surface/60 border border-nv-border
          "
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-nv-primary/10 to-nv-primary2/10" />
          <div
            className="
              relative h-full rounded-full shadow-glow-sm
              bg-gradient-to-r from-nv-primary to-nv-primary2
            "
            style={{ width: `${pct}%` }}
          />
          <div
            className="
                pointer-events-none absolute inset-0 rounded-full
                bg-gradient-to-r from-transparent via-white/30 to-transparent
                animate-shimmer w-full
              "
            style={{ transform: "translateX(-100%)" }}
          />
        </div>
      </div>
    </div>
  );
};

export default SideBarAccountSection;
