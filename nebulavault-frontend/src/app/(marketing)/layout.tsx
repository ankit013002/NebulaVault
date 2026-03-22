export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-bz-bg text-bz-text antialiased">
      {children}
    </div>
  );
}
