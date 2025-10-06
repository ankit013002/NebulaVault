"use client";

export async function logout() {
  try {
    const res = await fetch(`http://localhost:8080/auth/logout`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
}
