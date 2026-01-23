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
  useSidebar,
} from "@/components/ui/sidebar";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
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
  Command,
  FileText,
  X,
  Trash2,
  Newspaper,
  Users,
  Bug
} from "lucide-react";

export function AppSidebar() {
  const [location] = useLocation();
  const { openMobile, setOpenMobile, isMobile } = useSidebar();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

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

  // Show dashboard only for admins, My Tasks for all users, Settings only for admins
  const menuItems = [
    ...(currentUser?.role === "admin" 
      ? [{ titleKey: 'nav.dashboard', url: "/", icon: LayoutDashboard }]
      : []),
    ...(currentUser?.role === "admin" 
      ? [{ titleKey: 'nav.bug_messages', url: "/admin/bug-messages", icon: Bug }]
      : []),
    ...(currentUser?.role === "admin" 
      ? [{ titleKey: 'nav.admin', url: "/panel-settings", icon: Settings }]
      : []),
    { titleKey: 'nav.posts', url: "/posts", icon: Newspaper },
    { titleKey: 'nav.friends', url: "/friends", icon: Users },
    { titleKey: 'nav.tasks', url: "/tasks", icon: CheckSquare },
    { titleKey: 'nav.notes', url: "/notes", icon: FileText },
    { titleKey: 'nav.trash', url: "/trash", icon: Trash2 },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar/50 backdrop-blur-sm">
      <SidebarHeader className="h-14 sm:h-16 flex items-center justify-center border-b border-border/20 px-3 sm:px-4">
        <Link href="/posts" className="flex items-center gap-2 sm:gap-3 w-full group-data-[collapsible=icon]:justify-center hover:opacity-80 transition-opacity">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30">
            <Command className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="font-display font-bold text-base sm:text-lg tracking-tight group-data-[collapsible=icon]:hidden">
            TaskFlow
          </span>
        </Link>
        {/* Close button for mobile viewports <= 600px */}
        <button
          aria-label="Close sidebar"
          onClick={() => setOpenMobile(false)}
          className="inline-flex md:hidden absolute right-3 top-3 items-center justify-center h-9 w-9 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <X className="h-4 w-4" />
        </button>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 sm:px-2 sm:py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/70 font-medium px-2 mb-2 text-xs sm:text-sm">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    tooltip={t(item.titleKey!)}
                    className={`
                      rounded-lg sm:rounded-xl transition-all duration-200 ease-out h-9 sm:h-10 px-3 sm:px-4
                      focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-primary/5
                      ${location === item.url 
                        ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                        : item.titleKey === 'nav.notes'
                        ? 'text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 focus:bg-yellow-50 font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground focus:bg-muted'
                      }
                    `}
                  >
                    <Link href={item.url}>
                      <item.icon className={`h-4 w-4 sm:h-4 sm:w-4 ${location === item.url ? "text-primary" : item.titleKey === 'nav.notes' ? "text-yellow-600" : ""}`} />
                      <span className="text-sm sm:text-sm">
                        {t(item.titleKey!)}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Language Switcher */}
      <div className="px-3 py-2 border-t border-sidebar-border">
        <LanguageSwitcher />
      </div>

      <SidebarFooter className="p-3 sm:p-4 border-t border-border/20">
        <div className="flex items-center gap-2 sm:gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-tr from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-md flex-shrink-0 overflow-hidden">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={capitalizeFirstLetter(currentUser.name)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full rounded-full bg-gradient-to-tr from-violet-500 to-purple-500 flex items-center justify-center text-white"><svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>';
                  }
                }}
              />
            ) : (
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-semibold truncate">{currentUser?.name || "Guest"}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {currentUser?.role === "admin" ? "Admin" : currentUser ? "User" : "Not logged in"}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-auto text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 flex-shrink-0" aria-label="User menu">
                <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-52 bg-slate-50 border-slate-200">
              {currentUser ? (
                <>
                  <DropdownMenuItem asChild className="h-9 sm:h-10">
                    <Link href="/profile" className="flex items-center gap-2 px-3">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-sm">{t('profile.my_profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-9 sm:h-10">
                    <Link href="/settings" className="flex items-center gap-2 px-3">
                      <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-sm">{t('nav.settings')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)} className="text-destructive focus:text-destructive h-9 sm:h-10 px-3">
                    <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                    <span className="text-sm">{t('nav.logout')}</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild className="h-9 sm:h-10">
                  <Link href="/auth" className="flex items-center gap-2 px-3">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-sm">{t('common.login_signup')}</span>
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
            <AlertDialogTitle>{t('common.logout')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.logout_confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.logout')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <SidebarRail />
    </Sidebar>
  );
}
