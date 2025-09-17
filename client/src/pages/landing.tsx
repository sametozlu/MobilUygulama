import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import netmonLogo from "@assets/91d805a7-8fdc-4ebb-b3b4-bd232072a29d_1758095688515.png";

export default function Landing() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleLogin = () => {
    // Redirect to Replit Auth
    window.location.href = "/api/login";
  };

  const handleDemoLogin = (email: string) => {
    setFormData(prev => ({ ...prev, email }));
    // In a real implementation, you might pre-fill and submit
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-4">
              <img 
                src={netmonLogo} 
                alt="Netmon" 
                className="w-16 h-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground mb-2">Saha Yönetimi</h1>
            <p className="text-muted-foreground">Netmon hesabınızla giriş yapın</p>
          </div>

          {/* Login Form */}
          <form 
            className="space-y-6" 
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                E-posta Adresi
              </Label>
              <div className="relative">
                <Input
                  type="email"
                  id="email"
                  placeholder="kullanici@netmon.com.tr"
                  className="pl-12"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  data-testid="input-email"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                Şifre
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  className="pl-12 pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  data-testid="input-password"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                  }
                  data-testid="checkbox-remember"
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground">
                  Beni hatırla
                </Label>
              </div>
              <a href="#" className="text-sm text-primary hover:text-primary/80">
                Şifremi unuttum
              </a>
            </div>

            <Button
              type="submit"
              className="w-full"
              data-testid="button-login"
            >
              Giriş Yap
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-medium text-card-foreground mb-3">Demo Hesapları:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Saha Teknisyeni:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDemoLogin("teknisyen@netmon.com.tr")}
                  data-testid="button-demo-technician"
                  className="h-auto p-1 font-mono text-card-foreground hover:bg-accent"
                >
                  teknisyen@netmon.com.tr
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Admin:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDemoLogin("admin@netmon.com.tr")}
                  data-testid="button-demo-admin"
                  className="h-auto p-1 font-mono text-card-foreground hover:bg-accent"
                >
                  admin@netmon.com.tr
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Şifre: demo123
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
