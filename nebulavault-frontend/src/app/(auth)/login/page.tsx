import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export const metadata = {
  title: "Sign in — Nebula Vault",
  description: "Sign in to your Nebula Vault account.",
};

export default function Page() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your files, versions, and shares."
      footer={
        <p className="text-sm text-nv-muted">
          New here?{" "}
          <Link href="/register" className="link link-hover">
            Create an account
          </Link>
          .
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
