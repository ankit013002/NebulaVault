import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";

export const metadata = {
  title: "Create account — Nebula Vault",
  description: "Create your Nebula Vault account.",
};

export default function Page() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="One login for web & Electron. You control the keys."
      footer={
        <p className="text-sm text-nv-muted">
          Already have an account?{" "}
          <Link href="/login" className="link link-hover">
            Sign in
          </Link>
          .
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
