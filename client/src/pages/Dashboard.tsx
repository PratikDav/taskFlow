import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTasks } from "@/hooks/use-tasks";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { CheckCircle2, Clock, ListTodo, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminCreating, setAdminCreating] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const { data: tasks, isLoading } = useTasks();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const user = await res.json();
        setMe(user);

        // Check if user is admin
        if (!user || user.role !== "admin") {
          // Redirect to posts if not admin
          console.log("User is not admin, redirecting to posts. User:", user);
          setTimeout(() => setLocation("/posts"), 100);
          return;
        }
        console.log("Admin access granted for user:", user);
      } catch (err) {
        console.error("Auth check error:", err);
        setTimeout(() => setLocation("/posts"), 100);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [setLocation]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!me || me.role !== "admin") {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">
            You need to be logged in as an admin to access this dashboard.
          </p>
          <Button onClick={() => setLocation("/posts")}>
            Go to Posts
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center h-full">Loading dashboard...</div>;
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCreating(true);
    try {
      const response = await fetch("/api/auth/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create admin");
      }

      alert("Admin account created successfully!");
      setAdminForm({ name: "", email: "", password: "" });
      setAdminDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create admin");
    } finally {
      setAdminCreating(false);
    }
  };

  const allTasks = tasks || [];
  const completed = allTasks.filter(t => t.status === "done").length;
  const inProgress = allTasks.filter(t => t.status === "in_progress").length;
  const todo = allTasks.filter(t => t.status === "todo").length;
  const total = allTasks.length;

  const chartData = [
    { name: "To Do", count: todo, color: "#94a3b8" },
    { name: "In Progress", count: inProgress, color: "#8b5cf6" },
    { name: "Done", count: completed, color: "#22c55e" },
  ];

  const recentTasks = [...allTasks]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-lg">Here's what's happening with your projects.</p>
          </div>
          <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                Create Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Admin Account</DialogTitle>
                <DialogDescription>
                  Add a new administrator to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Full Name</Label>
                  <Input
                    id="admin-name"
                    type="text"
                    placeholder="Admin Name"
                    value={adminForm.name}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, name: e.target.value })
                    }
                    disabled={adminCreating}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@email.com"
                    value={adminForm.email}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, email: e.target.value })
                    }
                    disabled={adminCreating}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={adminForm.password}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, password: e.target.value })
                    }
                    disabled={adminCreating}
                    required
                  />
                </div>

                <Button type="submit" disabled={adminCreating} className="w-full">
                  {adminCreating ? "Creating..." : "Create Admin"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={item}>
          <SummaryCard 
            title="Total Tasks" 
            value={total} 
            icon={ListTodo} 
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
            iconClass="text-blue-600 bg-blue-100"
          />
        </motion.div>
        <motion.div variants={item}>
          <SummaryCard 
            title="In Progress" 
            value={inProgress} 
            icon={Clock} 
            className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100"
            iconClass="text-violet-600 bg-violet-100"
          />
        </motion.div>
        <motion.div variants={item}>
          <SummaryCard 
            title="Completed" 
            value={completed} 
            icon={CheckCircle2} 
            className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
            iconClass="text-emerald-600 bg-emerald-100"
          />
        </motion.div>
        <motion.div variants={item}>
          <SummaryCard 
            title="Completion Rate" 
            value={`${total ? Math.round((completed / total) * 100) : 0}%`} 
            icon={TrendingUp} 
            className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100"
            iconClass="text-orange-600 bg-orange-100"
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-4"
        >
          <Card className="h-[400px] border-border/50 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle>Task Status Overview</CardTitle>
              <CardDescription>Distribution of tasks by current status</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-3"
        >
          <Card className="h-[400px] border-border/50 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest tasks added to the workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.length === 0 && (
                  <p className="text-muted-foreground text-sm">No recent activity.</p>
                )}
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'done' ? 'bg-emerald-500' :
                        task.status === 'in_progress' ? 'bg-violet-500' : 'bg-slate-400'
                      }`} />
                      <span className="font-medium text-sm truncate max-w-[150px]">{task.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(task.createdAt || "").toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, className, iconClass }: any) {
  return (
    <Card className={`border-0 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl ${className}`}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-display font-bold">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}
