import { Switch, Route, useLocation } from "wouter";
import { Command } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import AuthPage from "@/pages/AuthPage";
import Admin from "@/pages/Admin";
import Posts from "@/pages/Posts";
import CreatePost from "@/pages/CreatePost";
import Notes from "@/pages/Notes";
import NoteDetail from "@/pages/NoteDetail";
import NoteEdit from "@/pages/NoteEdit";
import Trash from "@/pages/Trash";
import UserProfile from "@/pages/UserProfile";
import Friends from "@/pages/Friends";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/posts/create" component={CreatePost} />
      <Route path="/posts" component={Posts} />
      <Route path="/friends" component={Friends} />
      <Route path="/notes" component={Notes} />
      <Route path="/notes/:id" component={NoteDetail} />
      <Route path="/notes/:id/edit" component={NoteEdit} />
      <Route path="/trash" component={Trash} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/settings" component={Settings} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/:id" component={UserProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Routes that should be displayed full-screen without sidebar
  const fullScreenRoutes = ["/auth", "/login"];
  const isFullScreenRoute = fullScreenRoutes.includes(location);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isFullScreenRoute ? (
          // Full screen layout for auth pages
          <div className="min-h-screen w-full">
            <Router />
          </div>
        ) : (
          // Standard layout with sidebar
          <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background/50">
              <AppSidebar />
              <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <MobileHeader />
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 pt-2 md:pt-4 pb-4 md:pb-6">
                  <Router />
                </div>
              </main>
              {/* Notification dropdown on the right side - only show on non-fullscreen routes */}
              {!isFullScreenRoute && (
                <div className="fixed top-4 right-4 z-50">
                  <NotificationDropdown />
                </div>
              )}
            </div>
          </SidebarProvider>
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

function MobileHeader() {
  const { openMobile } = useSidebar();

  const base = "p-3 md:hidden flex items-center justify-between border-b border-border/20 backdrop-blur-md sticky top-0 z-50";
  // When sidebar is open on mobile, force a strong light background and dark text so
  // menu items remain readable against it.
  const openClass = "bg-white text-foreground shadow-xl";
  const closedClass = "bg-gradient-to-r from-white to-slate-100 text-foreground shadow-sm md:bg-transparent md:shadow-none";

  return (
    <div className={`${base} ${openMobile ? openClass : closedClass}`}>
      <SidebarTrigger className="h-9 w-9 hover:bg-muted transition-colors rounded-md" />
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <Command className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="font-bold text-base text-foreground tracking-tight">TaskFlow</span>
      </div>
      <div className="w-9" /> {/* Spacer for centering */}
    </div>
  );
}
