import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Car,
  ChevronRight,
  ListTodo
} from "lucide-react";
import type { FieldTaskWithUser } from "@shared/schema";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats } = useQuery<{
    todayTasks: number;
    completedTasks: number;
    pendingTasks: number;
    weeklyTasks: number;
  }>({
    queryKey: ["/api/analytics/user-stats"],
    enabled: isAuthenticated,
  });

  const { data: todayTasks = [] } = useQuery<FieldTaskWithUser[]>({
    queryKey: ["/api/field-tasks", { 
      date: new Date().toISOString().split('T')[0] 
    }],
    enabled: isAuthenticated,
  });

  const { data: upcomingTasks = [] } = useQuery<FieldTaskWithUser[]>({
    queryKey: ["/api/field-tasks"],
    enabled: isAuthenticated,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'pending':
        return 'Bekliyor';
      default:
        return status;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatDay = (date: Date | string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      weekday: 'short',
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
        <h2 className="text-xl font-bold mb-2" data-testid="text-welcome">
          Merhaba, {user?.firstName} {user?.lastName}
        </h2>
        <p className="opacity-90" data-testid="text-role">
          {user?.role === 'admin' ? 'Admin' : 'Saha Teknisyeni'}
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span data-testid="text-current-date">
              {new Date().toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </span>
          <span className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            <span data-testid="text-current-location">İstanbul</span>
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bugünkü Görevler</p>
              <p className="text-2xl font-bold text-card-foreground" data-testid="text-today-tasks">
                {stats?.todayTasks || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <ListTodo className="text-primary w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tamamlanan</p>
              <p className="text-2xl font-bold text-green-600" data-testid="text-completed-tasks">
                {stats?.completedTasks || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600 w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bekleyen</p>
              <p className="text-2xl font-bold text-amber-600" data-testid="text-pending-tasks">
                {stats?.pendingTasks || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="text-amber-600 w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bu Hafta</p>
              <p className="text-2xl font-bold text-card-foreground" data-testid="text-weekly-tasks">
                {stats?.weeklyTasks || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              <TrendingUp className="text-muted-foreground w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Bugünkü Görevler */}
      <Card className="rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Bugünkü Görevler</h3>
        </div>
        <div className="p-4 space-y-3">
          {todayTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ListTodo className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Bugün için görev bulunmuyor</p>
            </div>
          ) : (
            todayTasks.slice(0, 5).map((task) => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                data-testid={`card-task-${task.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500' : 
                    task.status === 'in_progress' ? 'bg-amber-500' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <p className="font-medium text-card-foreground" data-testid={`text-task-title-${task.id}`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-task-details-${task.id}`}>
                      {task.location} - {task.scheduledStartTime}-{task.scheduledEndTime}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(task.status)} data-testid={`badge-task-status-${task.id}`}>
                  {getStatusText(task.status)}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Yaklaşan Görevler */}
      <Card className="rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Yaklaşan Görevler</h3>
        </div>
        <div className="p-4 space-y-3">
          {upcomingTasks.filter(task => 
            task.scheduledDate && new Date(task.scheduledDate) > new Date()
          ).slice(0, 5).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Yaklaşan görev bulunmuyor</p>
            </div>
          ) : (
            upcomingTasks
              .filter(task => task.scheduledDate && new Date(task.scheduledDate) > new Date())
              .slice(0, 5)
              .map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  data-testid={`card-upcoming-task-${task.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-center min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {task.scheduledDate && formatDate(task.scheduledDate)}
                      </p>
                      <p className="text-sm font-medium text-card-foreground">
                        {task.scheduledDate && formatDay(task.scheduledDate)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground" data-testid={`text-upcoming-task-title-${task.id}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-upcoming-task-details-${task.id}`}>
                        {task.location} - {task.scheduledStartTime}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground w-5 h-5" />
                </div>
              ))
          )}
        </div>
      </Card>
    </div>
  );
}
