import { useState } from "react";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MoreVertical, 
  Trash2, 
  Star, 
  CheckCircle2, 
  Clock, 
  Circle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Tasks() {
  const { data: tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  if (isLoading) {
    return <div className="p-8">Loading tasks...</div>;
  }

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || task.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'done': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-violet-500" />;
      default: return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your day-to-day activities</p>
        </div>
        <CreateTaskDialog />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/50 p-2 rounded-2xl border border-white/20 backdrop-blur-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-10 bg-white border-transparent shadow-sm rounded-xl focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {['all', 'todo', 'in_progress', 'done'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                ${filter === f 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' 
                  : 'bg-white text-muted-foreground hover:bg-white/80'
                }
              `}
            >
              {f.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {filteredTasks?.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No tasks found. Try adjusting your filters or create a new task.
            </div>
          ) : (
            filteredTasks?.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                className={`
                  group bg-white p-4 rounded-2xl shadow-sm border border-border/40
                  hover:shadow-md hover:border-primary/20 transition-all duration-200
                  flex items-center gap-4
                  ${task.status === 'done' ? 'opacity-75 bg-slate-50' : ''}
                `}
              >
                <button 
                  onClick={() => updateTask.mutate({ 
                    id: task.id, 
                    status: task.status === 'done' ? 'todo' : 'done' 
                  })}
                  className="transition-transform active:scale-90"
                >
                  {getStatusIcon(task.status)}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`rounded-lg px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(task.createdAt || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 hover:bg-amber-50 hover:text-amber-500 ${task.isFavorite ? 'text-amber-500 opacity-100' : 'text-muted-foreground'}`}
                    onClick={() => updateTask.mutate({ id: task.id, isFavorite: !task.isFavorite })}
                  >
                    <Star className={`h-4 w-4 ${task.isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => deleteTask.mutate(task.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
