import BottomNav from "@/components/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50/50">
      {children}
      <BottomNav />
    </div>
  );
}
