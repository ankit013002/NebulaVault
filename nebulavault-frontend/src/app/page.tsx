import { getSession } from "@/utils/auth/loginlib";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/Dashboard");
  redirect("/login");
}
