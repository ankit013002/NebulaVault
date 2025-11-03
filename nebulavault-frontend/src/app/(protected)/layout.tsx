import { redirect } from "next/navigation";
import StoreProvider from "@/app/store/StoreProvider";
import { getSession } from "@/utils/auth/handlers/LoginHandler";
import Sidebar from "@/components/Sidebar/Sidebar";
import { cookies } from "next/headers";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  // TODO: Add if(session.isNew) after done testing and setting up serivce
  try {
    const cookieHeader = (await cookies()).toString();
    let res = null;

    res = await fetch(`${process.env.APP_BASE_URL}/api/dev-proxy/user/me`, {
      method: "GET",
      cache: "no-store",
      headers: {
        cookie: cookieHeader,
        "content-type": "application/json",
      },
    });
    if (res.status === 404) {
      res = await fetch(
        `${process.env.APP_BASE_URL}/api/dev-proxy/user/bootstrap`,
        {
          method: "POST",
          cache: "no-store",
          headers: {
            cookie: cookieHeader,
            "content-type": "application/json",
          },
        }
      );
    }
    const data = await res.json();
    console.log(data);

    if (!res.ok) console.error("Bootstrap failed:", res.status);
  } catch (err) {
    console.error("Bootstrap error:", err);
  }

  return (
    <StoreProvider>
      <div className="flex">
        <div className="h-screen max-w-[300px]">
          <Sidebar />
        </div>
        <div className="w-full h-screen">{children}</div>
      </div>
    </StoreProvider>
  );
}
