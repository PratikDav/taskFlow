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
<<<<<<< HEAD
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
=======
<<<<<<< HEAD
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
>>>>>>> e0fbc1d5f0f9aca9a16a08f28f51385ddb425180
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
<<<<<<< HEAD
  Users,
  Bug
=======
<<<<<<< HEAD
  Users,
  Bug
=======
  Users
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
    ...(currentUser?.role === "admin" 
      ? [{ titleKey: 'nav.dashboard', url: "/", icon: LayoutDashboard }]
      : []),
    ...(currentUser?.role === "admin" 
<<<<<<< HEAD
      ? [{ titleKey: 'nav.bug_messages', url: "/admin/bug-messages", icon: Bug }]
=======
      ? [{ title: t('nav.bug_messages'), url: "/admin/bug-messages", icon: Bug }]
=======
    { title: "Feed", url: "/posts", icon: Newspaper },
    { title: "Link Ups", url: "/friends", icon: Users },
    { title: "My Tasks", url: "/tasks", icon: CheckSquare },
    { title: "Notes", url: "/notes", icon: FileText },
    { title: "Trash", url: "/trash", icon: Trash2 },
>>>>>>> e0fbc1d5f0f9aca9a16a08f28f51385ddb425180
    ...(currentUser?.role === "admin" 
      ? [{ title: t('nav.dashboard'), url: "/", icon: LayoutDashboard }]
      : []),
    ...(currentUser?.role === "admin" 
<<<<<<< HEAD
      ? [
          { title: t('nav.admin'), url: "/panel-settings", icon: Settings },
          { title: t('bugMessage'), url: '/admin/bug-reports', icon: FileText }
        ]
=======
<<<<<<< HEAD
      ? [{ title: t('nav.admin'), url: "/panel-settings", icon: Settings }]
>>>>>>> 847b20290ac654e0dd9fe8d9811ddeb0089668c2
      : []),
    { title: t('nav.posts'), url: "/posts", icon: Newspaper },
    { title: t('nav.friends'), url: "/friends", icon: Users },
    { title: t('nav.tasks'), url: "/tasks", icon: CheckSquare },
    { title: t('nav.notes'), url: "/notes", icon: FileText },
    { title: t('nav.trash'), url: "/trash", icon: Trash2 },
=======
      ? [{ title: "Settings", url: "/settings", icon: Settings }]
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
      : []),
    ...(currentUser?.role === "admin" 
      ? [{ title: t('nav.admin'), url: "/panel-settings", icon: Settings }]
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
      : []),
    ...(currentUser?.role === "admin" 
      ? [{ titleKey: 'nav.admin', url: "/panel-settings", icon: Settings }]
      : []),
    { titleKey: 'nav.posts', url: "/posts", icon: Newspaper },
    { titleKey: 'nav.friends', url: "/friends", icon: Users },
    { titleKey: 'nav.tasks', url: "/tasks", icon: CheckSquare },
    { titleKey: 'nav.notes', url: "/notes", icon: FileText },
    { titleKey: 'nav.trash', url: "/trash", icon: Trash2 },
>>>>>>> e0fbc1d5f0f9aca9a16a08f28f51385ddb425180
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-gradient-to-b from-sidebar/60 via-sidebar/40 to-sidebar/60 backdrop-blur-xl shadow-xl">
      <SidebarHeader className="h-16 sm:h-18 flex items-center justify-center border-b border-border/30 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <Link href="/posts" className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center hover:scale-105 transition-all duration-300 relative z-10">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground font-bold shadow-lg shadow-primary/40 hover:shadow-primary/60 transition-all duration-300">
            <Command className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <span className="font-display font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">
            TaskFlow
          </span>
        </Link>
        {/* Close button for mobile viewports <= 600px */}
        <button
          aria-label="Close sidebar"
          onClick={() => setOpenMobile(false)}
          className="inline-flex md:hidden absolute right-4 top-4 items-center justify-center h-8 w-8 rounded-lg hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 hover:scale-110"
        >
          <X className="h-4 w-4" />
        </button>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 sm:px-4 sm:py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/80 font-semibold px-3 mb-3 text-xs sm:text-sm uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    tooltip={t(item.titleKey!)}
                    className={`
                      group relative rounded-xl sm:rounded-2xl transition-all duration-300 ease-out h-11 sm:h-12 px-4 sm:px-5
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-primary/5
                      hover:scale-[1.02] hover:shadow-md
                      ${location === item.url 
<<<<<<< HEAD
                        ? 'bg-gradient-to-r from-primary/15 to-primary/10 text-primary font-semibold shadow-lg shadow-primary/20 border border-primary/20' 
                        : item.title === 'Notes'
                        ? 'text-amber-600 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-25 hover:text-amber-700 focus:bg-amber-50 font-medium hover:shadow-amber-100/50'
                        : 'text-muted-foreground hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 hover:text-foreground focus:bg-muted/50 hover:shadow-lg hover:shadow-muted/20'
                      }
                    `}
                  >
                    <Link href={item.url} className="flex items-center gap-3 sm:gap-4 w-full">
                      <div className={`
                        flex items-center justify-center w-5 h-5 rounded-lg transition-all duration-300
                        ${location === item.url 
                          ? 'bg-primary/20 text-primary' 
                          : item.title === 'Notes'
                          ? 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'
                          : 'bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                        }
                      `}>
                        <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <span className="text-sm sm:text-sm font-medium">{item.title}</span>
                      {location === item.url && (
                        <div className="absolute right-2 w-1.5 h-6 bg-primary rounded-full animate-pulse"></div>
                      )}
=======
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
>>>>>>> 847b20290ac654e0dd9fe8d9811ddeb0089668c2
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Language Switcher */}
      <div className="px-4 py-3 border-t border-border/30 bg-gradient-to-r from-muted/20 to-transparent">
        <LanguageSwitcher />
      </div>

      <SidebarFooter className="p-4 sm:p-5 border-t border-border/30 bg-gradient-to-t from-muted/10 to-transparent">
        <div className="flex items-center gap-3 sm:gap-4 group-data-[collapsible=icon]:justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-xl"></div>
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 flex-shrink-0 overflow-hidden ring-2 ring-white/20 hover:ring-white/40 relative z-10">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={capitalizeFirstLetter(currentUser.name)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white"><svg class="h-4 w-4 sm:h-4.5 sm:w-4.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>';
                  }
                }}
              />
            ) : (
              <User className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            )}
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0 flex-1 relative z-10">
            <span className="text-sm sm:text-base font-bold truncate text-foreground">{currentUser?.name || "Guest"}</span>
            <span className="text-xs text-muted-foreground/80 capitalize font-medium">
              {currentUser?.role === "admin" ? "Administrator" : currentUser ? "Member" : "Not logged in"}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-auto text-muted-foreground hover:text-foreground transition-all duration-200 p-2 rounded-lg hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/30 hover:scale-110 flex-shrink-0 relative z-10" aria-label="User menu">
                <ChevronUp className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 sm:w-56 bg-white/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-xl">
              {currentUser ? (
                <>
                  <DropdownMenuItem asChild className="h-11 rounded-lg mx-1 my-1 hover:bg-primary/10 focus:bg-primary/10">
                    <Link href="/profile" className="flex items-center gap-3 px-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">{t('profile.my_profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-11 rounded-lg mx-1 my-1 hover:bg-primary/10 focus:bg-primary/10">
                    <Link href="/settings" className="flex items-center gap-3 px-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Settings className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">{t('nav.settings')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)} className="text-red-600 focus:text-red-600 focus:bg-red-50 h-11 rounded-lg mx-1 my-1 hover:bg-red-50">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                      <LogOut className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="text-sm font-medium">{t('nav.logout')}</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild className="h-11 rounded-lg mx-1 my-1 hover:bg-primary/10 focus:bg-primary/10">
                  <Link href="/auth" className="flex items-center gap-3 px-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">{t('common.login_signup')}</span>
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
