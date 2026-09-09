import AuthShell from "../_components/AuthShell";
import RegisterForm from "../_components/RegisterForm";
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
        <p className="text-sm text-bz-muted">
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
