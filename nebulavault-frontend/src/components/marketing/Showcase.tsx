"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MoreHorizontal, Folder, FileText } from "lucide-react";

const rows = [
  {
    icon: Folder,
    name: "Folder1",
    owner: "Owner",
    modified: "9/24/2025, 5:54:28 PM",
    size: "9.69 KB",
  },
  {
    icon: FileText,
    name: "example3.pdf",
    owner: "Owner",
    modified: "9/24/2025, 5:54:25 PM",
    size: "2.58 KB",
  },
];

export default function Showcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          className="rounded-2xl border border-nv-border bg-nv-surface/60 backdrop-blur-sm shadow-card overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between p-5">
            <h3 className="text-2xl font-semibold text-nv-text">
              File preview
            </h3>
            <span className="text-xs px-2 py-1 rounded-full border border-nv-border bg-nv-card/60 text-nv-muted">
              Matches in-app UI
            </span>
          </div>

          <div className="border-t border-nv-border">
            <div className="grid grid-cols-12 px-5 py-3 text-sm text-nv-muted">
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Owner</div>
              <div className="col-span-3">Last Modified</div>
              <div className="col-span-1">File Size</div>
              <div className="col-span-1 text-right">Options</div>
            </div>

            <div className="divide-y divide-nv-border">
              {rows.map((r, i) => (
                <motion.div
                  key={r.name}
                  className="grid grid-cols-12 px-5 py-4 hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <r.icon className="size-4 text-nv-primary" />
                    <span className="text-nv-text">{r.name}</span>
                  </div>
                  <div className="col-span-2 text-nv-muted">{r.owner}</div>
                  <div className="col-span-3 text-nv-muted">{r.modified}</div>
                  <div className="col-span-1 text-nv-muted">{r.size}</div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      className="p-1 rounded-md hover:bg-nv-card border border-transparent hover:border-nv-border transition"
                      aria-label={`Options for ${r.name}`}
                    >
                      <MoreHorizontal className="size-5 text-nv-muted" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
