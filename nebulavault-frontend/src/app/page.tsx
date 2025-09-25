import { getSession } from "@/utils/auth/handlers/LoginHandler";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  redirect("/login");
}
