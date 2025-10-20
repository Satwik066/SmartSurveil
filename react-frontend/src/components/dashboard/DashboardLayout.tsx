import { ReactNode, useState } from "react";
import { Bell, Video, LayoutDashboard, Camera, FileText, BarChart3, Settings, LogOut, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: ReactNode;
  user: { username?: string };
  onLogout: () => void;
  onNavigate?: (section: string) => void;
}

const DashboardLayout = ({ children, user, onLogout, onNavigate }: DashboardLayoutProps) => {
  const [notificationCount] = useState(0);
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleNavigation = (section: string) => {
    setActiveSection(section.toLowerCase());
    if (onNavigate) {
      onNavigate(section.toLowerCase());
    }
  };

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, section: "dashboard" },
    { title: "Cameras", icon: Camera, section: "cameras" },
    { title: "Logs", icon: FileText, section: "logs" },
    { title: "Analytics", icon: BarChart3, section: "analytics" },
    { title: "Settings", icon: Settings, section: "settings" },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">SmartSurveil</h2>
                <p className="text-xs text-muted-foreground">AI Security</p>
              </div>
            </div>
          </div>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        isActive={activeSection === item.section}
                        onClick={() => handleNavigation(item.section)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 border-b border-border bg-card backdrop-blur-sm">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cameras..."
                    className="pl-9 bg-background/50"
                  />
                </div>
              </div>

              <div className="ml-auto flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-white">
                      {notificationCount}
                    </span>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline">{user.username || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
