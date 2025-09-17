import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Car,
  ChevronRight,
  Filter
} from "lucide-react";
import type { FieldTaskWithUser } from "@shared/schema";

export default function Tasks() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    status: "",
    date: "",
    search: "",
  });

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

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<FieldTaskWithUser[]>({
    queryKey: ["/api/field-tasks", filters],
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

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Filter Section */}
      <Card className="rounded-xl border border-border p-4">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtrele & Ara
        </h3>
        
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label className="block text-sm font-medium text-card-foreground mb-2">
                Durum
              </Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                  <SelectItem value="pending">Bekliyor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label className="block text-sm font-medium text-card-foreground mb-2">
                Tarih
              </Label>
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                data-testid="input-date-filter"
              />
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-card-foreground mb-2">
              Ara
            </Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Görev, lokasyon veya müşteri ara..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
                data-testid="input-search-filter"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasksLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Görevler yükleniyor...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Görev bulunamadı</p>
            <p className="text-sm text-muted-foreground mt-2">
              Farklı filtreler deneyerek arama yapabilirsiniz
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="rounded-xl border border-border p-4" data-testid={`card-task-${task.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-card-foreground" data-testid={`text-task-title-${task.id}`}>
                      {task.title}
                    </h4>
                    <Badge className={getStatusColor(task.status)} data-testid={`badge-task-status-${task.id}`}>
                      {getStatusText(task.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2" data-testid={`text-task-customer-${task.id}`}>
                    {task.customerName && `Müşteri: ${task.customerName}`}
                    {task.customerPhone && ` | Tel: ${task.customerPhone}`}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center" data-testid={`text-task-location-${task.id}`}>
                      <MapPin className="w-4 h-4 mr-1" />
                      {task.location}
                    </span>
                    <span className="flex items-center" data-testid={`text-task-date-${task.id}`}>
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(task.scheduledDate)}
                    </span>
                    {task.scheduledStartTime && task.scheduledEndTime && (
                      <span className="flex items-center" data-testid={`text-task-time-${task.id}`}>
                        <Clock className="w-4 h-4 mr-1" />
                        {task.scheduledStartTime}-{task.scheduledEndTime}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" data-testid={`button-task-details-${task.id}`}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <Car className="text-primary w-4 h-4" />
                    <span className="text-muted-foreground" data-testid={`text-task-vehicle-${task.id}`}>
                      {task.vehiclePlate || 'Araç atanmamış'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      data-testid={`button-task-detail-${task.id}`}
                    >
                      Detay
                    </Button>
                    <Button 
                      size="sm"
                      data-testid={`button-task-action-${task.id}`}
                    >
                      {task.status === 'completed' ? 'Rapor' : 'Güncelle'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
