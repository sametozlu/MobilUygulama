import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  Check,
  FileText,
  Clock,
  ChevronRight
} from "lucide-react";
import type { User } from "@shared/schema";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated or not admin
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

    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Bu sayfaya erişim yetkiniz bulunmuyor.",
        variant: "destructive",
      });
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: recentActivities = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/recent-activities"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;
  if (user?.role !== 'admin') {
    return (
      <div className="p-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Erişim Reddedildi</h2>
        <p className="text-muted-foreground">Bu sayfaya erişim yetkiniz bulunmuyor.</p>
      </div>
    );
  }

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getActivityIcon = (type: string, action: string) => {
    if (type === 'task' && action === 'completed') {
      return <Check className="text-green-600 text-sm w-4 h-4" />;
    }
    if (type === 'report') {
      return <FileText className="text-blue-600 text-sm w-4 h-4" />;
    }
    return <Clock className="text-amber-600 text-sm w-4 h-4" />;
  };

  const getActivityText = (activity: any) => {
    if (activity.type === 'task' && activity.action === 'completed') {
      return 'kurulum işlemini tamamladı';
    }
    if (activity.type === 'report') {
      return 'rapor gönderdi';
    }
    return 'işlem gerçekleştirdi';
  };

  const formatTimeAgo = (timestamp: string | Date) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} dakika önce`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} saat önce`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} gün önce`;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Admin Paneli</h2>
        <p className="opacity-90">Tüm saha ekiplerini yönetin</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="h-auto p-4 text-center flex-col hover:bg-accent"
          data-testid="button-team-management"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
            <Users className="text-primary w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-card-foreground">Ekip Yönetimi</p>
        </Button>

        <Button 
          variant="outline" 
          className="h-auto p-4 text-center flex-col hover:bg-accent"
          data-testid="button-reports-overview"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
            <BarChart3 className="text-green-600 w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-card-foreground">Raporlar</p>
        </Button>

        <Button 
          variant="outline" 
          className="h-auto p-4 text-center flex-col hover:bg-accent"
          data-testid="button-settings"
        >
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
            <Settings className="text-amber-600 w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-card-foreground">Ayarlar</p>
        </Button>

        <Button 
          variant="outline" 
          className="h-auto p-4 text-center flex-col hover:bg-accent"
          data-testid="button-alerts"
        >
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-2">
            <AlertTriangle className="text-red-600 w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-card-foreground">Uyarılar</p>
        </Button>
      </div>

      {/* Team Overview */}
      <Card className="rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Saha Ekipleri</h3>
        </div>
        <div className="p-4 space-y-3">
          {allUsers.filter(u => u.role === 'technician').length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Saha teknisyeni bulunmuyor</p>
            </div>
          ) : (
            allUsers
              .filter(u => u.role === 'technician')
              .map((teamMember) => (
                <div 
                  key={teamMember.id} 
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  data-testid={`card-team-member-${teamMember.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={teamMember.profileImageUrl || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(teamMember.firstName, teamMember.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-card-foreground" data-testid={`text-member-name-${teamMember.id}`}>
                        {teamMember.firstName} {teamMember.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-member-details-${teamMember.id}`}>
                        {teamMember.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <Button variant="ghost" size="sm" data-testid={`button-member-details-${teamMember.id}`}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
          )}
        </div>
      </Card>

      {/* Recent Activities */}
      <Card className="rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Son Aktiviteler</h3>
        </div>
        <div className="p-4 space-y-3">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Son aktivite bulunmuyor</p>
            </div>
          ) : (
            recentActivities.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-start space-x-3" data-testid={`activity-${index}`}>
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mt-0.5">
                  {getActivityIcon(activity.type, activity.action)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-card-foreground" data-testid={`text-activity-description-${index}`}>
                    <span className="font-medium">
                      {activity.user?.firstName} {activity.user?.lastName}
                    </span>{' '}
                    {getActivityText(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`text-activity-time-${index}`}>
                    {activity.location} • {activity.timestamp && formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
