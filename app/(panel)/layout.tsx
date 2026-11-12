import { Sidebar, MobileHeader, MobileTabBar } from "@/components/sidebar";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main className="flex-1 p-4 pb-24 md:p-6 lg:p-8">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  );
}
