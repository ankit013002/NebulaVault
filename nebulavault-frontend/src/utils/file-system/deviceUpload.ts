/**
 * Uploading to the user's own devices.
 *
 * The browser hashes the file, asks the control plane where it should live, and
 * PUTs the bytes straight to those devices. Bytes never pass through Next.js,
 * the gateway or the control plane — those only decide and authorise.
 */

export interface UploadTarget {
  deviceId: string;
  deviceName: string;
  url: string;
  grant: string;
  expiresAt: string;
}

export interface UploadPlan {
  objectHash: string;
  sizeBytes: number;
  desiredReplicas: number;
  alreadyHeldBy: string[];
  targets: UploadTarget[];
  shortfall: boolean;
  reason?: string;
  singleCopy: boolean;
}

export interface DeviceUploadResult {
  objectHash: string;
  /** Devices that accepted the bytes. */
  storedOn: string[];
  /** Devices that could not be reached or refused. */
  failed: Array<{ deviceName: string; reason: string }>;
  desiredReplicas: number;
  shortfall: boolean;
}

/** Human wording for a placement shortfall. */
export const SHORTFALL_MESSAGE: Record<string, string> = {
  no_devices:
    "You have not added any devices yet, so there is nowhere to store this.",
  none_online:
    "None of your devices are online right now, so there is nowhere to store this.",
  insufficient_capacity:
    "Your devices do not have enough free space for the number of copies you asked for.",
  unreachable_devices:
    "Your devices are online but have not reported an address this browser can reach.",
};

/**
 * SHA-256 of the file, computed in the browser.
 *
 * Content addressing needs the hash *before* placement, so this necessarily
 * happens client-side. `crypto.subtle` requires the whole buffer in memory,
 * which is fine for ordinary files and is the reason chunking exists in the
 * architecture — a 40 GB video will need a streaming hash over chunks.
 */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function messageFrom(res: Response, fallback: string): Promise<string> {
  try {
    const payload = (await res.json()) as { message?: unknown };
    if (typeof payload.message === "string" && payload.message !== "") {
      return payload.message;
    }
  } catch {
    // Non-JSON body.
  }
  return fallback;
}

/** Asks the control plane where an object should be stored. */
export async function planUpload(
  objectHash: string,
  sizeBytes: number
): Promise<UploadPlan> {
  const res = await fetch("/api/placement/upload-targets", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ objectHash, sizeBytes }),
  });

  if (!res.ok) {
    throw new Error(await messageFrom(res, "Could not work out where to store this"));
  }

  return ((await res.json()) as { data: UploadPlan }).data;
}

/**
 * Sends one file to every device the control plane chose.
 *
 * Failures are collected rather than thrown: reaching one of two devices still
 * stores the file, and the vault reports it as degraded so repair can finish
 * later. Throwing would discard a copy that did land.
 */
export async function uploadToDevices(
  file: File,
  onProgress?: (message: string) => void
): Promise<DeviceUploadResult> {
  onProgress?.(`Preparing ${file.name}…`);
  const objectHash = await hashFile(file);

  const plan = await planUpload(objectHash, file.size);

  const storedOn = [...plan.alreadyHeldBy];
  const failed: DeviceUploadResult["failed"] = [];

  for (const target of plan.targets) {
    onProgress?.(`Sending ${file.name} to ${target.deviceName}…`);
    try {
      const res = await fetch(target.url, {
        method: "PUT",
        headers: {
          "X-Transfer-Grant": target.grant,
          "Content-Type": "application/octet-stream",
        },
        body: file,
      });

      if (!res.ok) {
        failed.push({
          deviceName: target.deviceName,
          reason: await messageFrom(res, `refused with ${res.status}`),
        });
        continue;
      }

      // Only now does the control plane consider the copy real.
      await confirmStored(objectHash, target.deviceId, file.size);
      storedOn.push(target.deviceId);
    } catch {
      // A device on a LAN this browser cannot reach fails here rather than
      // returning a status, so it is reported as unreachable, not refused.
      failed.push({ deviceName: target.deviceName, reason: "could not be reached" });
    }
  }

  return {
    objectHash,
    storedOn,
    failed,
    desiredReplicas: plan.desiredReplicas,
    shortfall: storedOn.length < plan.desiredReplicas,
  };
}

async function confirmStored(
  objectHash: string,
  deviceId: string,
  sizeBytes: number
): Promise<void> {
  const res = await fetch("/api/placement/confirm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ objectHash, deviceId, sizeBytes }),
  });

  if (!res.ok) {
    throw new Error(await messageFrom(res, "Could not record where the file was stored"));
  }
}

/** Fetches an object back from whichever device holds it. */
export async function downloadFromDevices(
  objectHash: string,
  filename: string
): Promise<void> {
  const res = await fetch(
    `/api/placement/download-targets/${encodeURIComponent(objectHash)}`
  );
  if (!res.ok) {
    throw new Error(await messageFrom(res, "Could not find this file on your devices"));
  }

  const { targets } = ((await res.json()) as { data: { targets: UploadTarget[] } }).data;
  if (targets.length === 0) {
    throw new Error("None of the devices holding this file are reachable right now");
  }

  // Try each holder in turn: the first may be asleep or on another network.
  for (const target of targets) {
    try {
      const objectRes = await fetch(target.url, {
        headers: { "X-Transfer-Grant": target.grant },
      });
      if (!objectRes.ok) continue;

      const blob = await objectRes.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      return;
    } catch {
      // Unreachable device; fall through to the next holder.
    }
  }

  throw new Error("None of the devices holding this file could be reached");
}
