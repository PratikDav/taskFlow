import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Settings, 
  User, 
  LogOut,
  ChevronUp,
  Command
} from "lucide-react";

export function AppSidebar() {
  const [location] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const user = await res.json();
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      setLogoutDialogOpen(false);
      setCurrentUser(null);
      setLocation("/posts");
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Show dashboard only for admins, My Tasks for all users
  const menuItems = [
    ...(currentUser?.role === "admin" 
      ? [{ title: "Dashboard", url: "/", icon: LayoutDashboard }]
      : []),
    { title: "My Tasks", url: "/tasks", icon: CheckSquare },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/20 px-4">
        <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30">
            <Command className="h-4 w-4" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
            TaskFlow
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/70 font-medium px-2 mb-2">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    tooltip={item.title}
                    className={`
                      rounded-xl transition-all duration-200 ease-out h-10
                      ${location === item.url 
                        ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    <Link href={item.url}>
                      <item.icon className={location === item.url ? "text-primary" : ""} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/20">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-md">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">{currentUser?.name || "Guest"}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {currentUser?.role === "admin" ? "Admin" : currentUser ? "User" : "Not logged in"}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
                <ChevronUp className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {currentUser ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/auth" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Login/Sign Up
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will be signed out and redirected to the posts page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <SidebarRail />
    </Sidebar>
  );
}
