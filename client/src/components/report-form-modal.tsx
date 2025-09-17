import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MapPin, 
  Car, 
  Calendar, 
  Clock, 
  Wrench, 
  ClipboardList, 
  Camera,
  X,
  Crosshair
} from "lucide-react";

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportFormModal({ isOpen, onClose }: ReportFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    location: "",
    vehiclePlate: "",
    reportDate: new Date().toISOString().split('T')[0],
    reportTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
    operationType: "",
    customerName: "",
    customerPhone: "",
    details: "",
    photos: [] as string[],
    status: "draft" as "draft" | "submitted",
  });

  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      await apiRequest("POST", "/api/field-reports", reportData);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Rapor başarıyla oluşturuldu",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/field-reports"] });
      onClose();
      resetForm();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Hata",
        description: "Rapor oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      location: "",
      vehiclePlate: "",
      reportDate: new Date().toISOString().split('T')[0],
      reportTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
      operationType: "",
      customerName: "",
      customerPhone: "",
      details: "",
      photos: [],
      status: "draft",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.location || !formData.vehiclePlate || !formData.operationType) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen zorunlu alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    createReportMutation.mutate(formData);
  };

  const handleSaveDraft = () => {
    setFormData(prev => ({ ...prev, status: "draft" }));
    createReportMutation.mutate({ ...formData, status: "draft" });
  };

  const handleSubmitReport = () => {
    setFormData(prev => ({ ...prev, status: "submitted" }));
    createReportMutation.mutate({ ...formData, status: "submitted" });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ 
            ...prev, 
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
          }));
          toast({
            title: "Konum Alındı",
            description: "Güncel konumunuz otomatik olarak eklendi",
          });
        },
        (error) => {
          toast({
            title: "Konum Hatası",
            description: "Konum bilgisi alınamadı",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Saha Raporu
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-modal">
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lokasyon */}
          <div>
            <Label className="block text-sm font-medium text-card-foreground mb-2">
              <MapPin className="w-4 h-4 inline mr-2 text-primary" />
              Lokasyon *
            </Label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Adres bilgisi"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="flex-1"
                required
                data-testid="input-location"
              />
              <Button 
                type="button" 
                variant="secondary" 
                onClick={getCurrentLocation}
                data-testid="button-get-location"
              >
                <Crosshair className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Araç Bilgisi */}
          <div>
            <Label className="block text-sm font-medium text-card-foreground mb-2">
              <Car className="w-4 h-4 inline mr-2 text-primary" />
              Araç Plakası *
            </Label>
            <Input
              type="text"
              placeholder="34 ABC 123"
              value={formData.vehiclePlate}
              onChange={(e) => setFormData(prev => ({ ...prev, vehiclePlate: e.target.value }))}
              required
              data-testid="input-vehicle-plate"
            />
          </div>

          {/* Tarih ve Saat */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-card-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-2 text-primary" />
                Tarih *
              </Label>
              <Input
                type="date"
                value={formData.reportDate}
                onChange={(e) => setFormData(prev => ({ ...prev, reportDate: e.target.value }))}
                required
                data-testid="input-report-date"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-card-foreground mb-2">
                <Clock className="w-4 h-4 inline mr-2 text-primary" />
                Saat *
              </Label>
              <Input
                type="time"
                value={formData.reportTime}
                onChange={(e) => setFormData(prev => ({ ...prev, reportTime: e.target.value }))}
                required
                data-testid="input-report-time"
              />
            </div>
          </div>

          {/* İşlem Tipi */}
          <div>
            <Label className="block text-sm font-medium text-card-foreground mb-2">
              <Wrench className="w-4 h-4 inline mr-2 text-primary" />
              İşlem Tipi *
            </Label>
            <Select 
              value={formData.operationType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, operationType: value }))}
            >
              <SelectTrigger data-testid="select-operation-type">
                <SelectValue placeholder="İşlem tipini seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fiber Optik Kurulumu">Fiber Optik Kurulumu</SelectItem>
                <SelectItem value="Modem Değişimi">Modem Değişimi</SelectItem>
                <SelectItem value="Hat Bakımı">Hat Bakımı</SelectItem>
                <SelectItem value="Arıza Giderme">Arıza Giderme</SelectItem>
                <SelectItem value="Kontrol">Kontrol</SelectItem>
                <SelectItem value="Diğer">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Müşteri Bilgileri */}
          <div className="space-y-4">
            <h3 className="font-medium text-card-foreground">Müşteri Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Ad Soyad"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                data-testid="input-customer-name"
              />
              <Input
                type="tel"
                placeholder="Telefon"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                data-testid="input-customer-phone"
              />
            </div>
          </div>

          {/* İşlem Detayları */}
          <div>
            <Label className="block text-sm font-medium text-card-foreground mb-2">
              <ClipboardList className="w-4 h-4 inline mr-2 text-primary" />
              İşlem Detayları
            </Label>
            <Textarea
              rows={4}
              placeholder="Yapılan işlemler, kullanılan malzemeler ve notlar..."
              value={formData.details}
              onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              className="resize-none"
              data-testid="textarea-details"
            />
          </div>

          {/* Fotoğraf */}
          <div>
            <Label className="block text-sm font-medium text-card-foreground mb-2">
              <Camera className="w-4 h-4 inline mr-2 text-primary" />
              Fotoğraflar
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Fotoğraf eklemek için tıklayın</p>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                data-testid="input-photos"
              />
              <Button type="button" variant="secondary" size="sm">
                Dosya Seç
              </Button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleSaveDraft}
              disabled={createReportMutation.isPending}
              data-testid="button-save-draft"
            >
              Taslak Kaydet
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmitReport}
              disabled={createReportMutation.isPending}
              data-testid="button-submit-report"
            >
              {createReportMutation.isPending ? "Kaydediliyor..." : "Rapor Gönder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
