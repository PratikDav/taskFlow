import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/posts/create" component={CreatePost} />
      <Route path="/posts" component={Posts} />
      <Route path="/notes" component={Notes} />
      <Route path="/notes/:id" component={NoteDetail} />
      <Route path="/notes/:id/edit" component={NoteEdit} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/settings" component={Settings} />
      <Route path="/profile" component={Profile} />
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
                <div className="p-4 md:hidden">
                  <SidebarTrigger />
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-2">
                  <Router />
                </div>
              </main>
            </div>
          </SidebarProvider>
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
