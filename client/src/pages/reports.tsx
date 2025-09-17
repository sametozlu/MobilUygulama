import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReportFormModal from "@/components/report-form-modal";
import { 
  Plus, 
  FileText, 
  Download, 
  Edit,
  CheckCircle,
  Clock
} from "lucide-react";
import type { FieldReportWithRelations } from "@shared/schema";

export default function Reports() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showReportForm, setShowReportForm] = useState(false);

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

  const { data: reports = [], isLoading: reportsLoading } = useQuery<FieldReportWithRelations[]>({
    queryKey: ["/api/field-reports"],
    enabled: isAuthenticated,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Tamamlandı';
      case 'draft':
        return 'Taslak';
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

  // Calculate report stats
  const completedReports = reports.filter(r => r.status === 'submitted').length;
  const draftReports = reports.filter(r => r.status === 'draft').length;

  return (
    <div className="p-4 space-y-6">
      {/* New Report Button */}
      <Button
        className="w-full py-3 rounded-xl font-medium"
        onClick={() => setShowReportForm(true)}
        data-testid="button-new-report"
      >
        <Plus className="w-5 h-5 mr-2" />
        Yeni Rapor Oluştur
      </Button>

      {/* Recent Reports */}
      <Card className="rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Son Raporlar</h3>
        </div>
        <div className="p-4 space-y-3">
          {reportsLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Raporlar yükleniyor...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Henüz rapor bulunmuyor</p>
              <p className="text-sm text-muted-foreground mt-2">
                İlk raporunuzu oluşturmak için yukarıdaki butona tıklayın
              </p>
            </div>
          ) : (
            reports.slice(0, 10).map((report) => (
              <div 
                key={report.id} 
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                data-testid={`card-report-${report.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    report.status === 'submitted' ? 'bg-primary/10' : 'bg-amber-100'
                  }`}>
                    <FileText className={`${
                      report.status === 'submitted' ? 'text-primary' : 'text-amber-600'
                    } w-5 h-5`} />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground" data-testid={`text-report-title-${report.id}`}>
                      {report.operationType} Raporu #{report.id?.slice(0, 8) || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-report-details-${report.id}`}>
                      {formatDate(report.reportDate)} - {report.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(report.status)} data-testid={`badge-report-status-${report.id}`}>
                    {getStatusText(report.status)}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    data-testid={`button-report-action-${report.id}`}
                  >
                    {report.status === 'submitted' ? (
                      <Download className="w-4 h-4" />
                    ) : (
                      <Edit className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border border-border text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="text-green-600 text-xl w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-card-foreground" data-testid="text-completed-reports">
            {completedReports}
          </p>
          <p className="text-sm text-muted-foreground">Tamamlanan Rapor</p>
        </Card>

        <Card className="p-4 border border-border text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Clock className="text-amber-600 text-xl w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-card-foreground" data-testid="text-pending-reports">
            {draftReports}
          </p>
          <p className="text-sm text-muted-foreground">Bekleyen Rapor</p>
        </Card>
      </div>

      {/* Report Form Modal */}
      <ReportFormModal 
        isOpen={showReportForm} 
        onClose={() => setShowReportForm(false)} 
      />
    </div>
  );
}
