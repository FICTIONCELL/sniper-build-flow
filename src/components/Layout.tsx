import { AppSidebar } from "@/components/AppSidebar";
import { SearchBar } from "@/components/SearchBar";
import { TopBar } from "@/components/TopBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { NotificationProvider } from "@/contexts/NotificationContext";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isCompactMode, setIsCompactMode] = useLocalStorage("compactMode", false);

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    // Implement global search logic here
  };

  return (
    <NotificationProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <h1 className="text-lg font-semibold">Gestion de Projets Construction</h1>
                  <SearchBar onSearch={handleSearch} />
                </div>
                <TopBar
                  onCompactModeToggle={() => setIsCompactMode(!isCompactMode)}
                  isCompactMode={isCompactMode}
                />
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </NotificationProvider>
  );
}