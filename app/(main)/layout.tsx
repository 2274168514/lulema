import BottomNav from "@/components/BottomNav";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50/50">
      {children}
      <BottomNav />
    </div>
  );
}
