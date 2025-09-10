import Navbar from "@/components/navbar/page";
import { AppSidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col min-w-0">
          <Navbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
            <div className="h-full w-full">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
