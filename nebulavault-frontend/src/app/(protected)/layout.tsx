// app/(protected)/layout.tsx
import { redirect } from "next/navigation";
import StoreProvider from "@/app/store/StoreProvider";
import { getSession } from "@/utils/auth/handlers/LoginHandler";
import Sidebar from "@/components/Sidebar/Sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <StoreProvider>
      <div className="flex">
        <div className="w-[20%] h-screen max-w-[300px]">
          <Sidebar />
        </div>
        <div className="w-full h-screen">{children}</div>
      </div>
    </StoreProvider>
  );
}
