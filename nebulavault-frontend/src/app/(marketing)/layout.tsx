export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-nv-bg text-nv-text antialiased">
      {children}
    </div>
  );
}
