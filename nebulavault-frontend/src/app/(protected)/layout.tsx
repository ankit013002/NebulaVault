// app/(protected)/layout.tsx
import { redirect } from "next/navigation";
import StoreProvider from "@/app/store/StoreProvider";
import MainSidebar from "@/components/MainSidebar";
import { getSession } from "@/utils/auth/handlers/LoginHandler";

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
          <MainSidebar />
        </div>
        <div className="w-full h-screen">{children}</div>
      </div>
    </StoreProvider>
  );
}
