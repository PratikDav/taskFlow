import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/LanguageContext";

export default function Settings() {
  const [settings, setSettings] = useState({
    darkMode: false,
    compactMode: false,
    emailNotifications: true,
    taskReminders: true,
  });
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("app-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          darkMode: parsed.darkMode || false,
          compactMode: parsed.compactMode || false,
          emailNotifications: parsed.emailNotifications !== undefined ? parsed.emailNotifications : true,
          taskReminders: parsed.taskReminders !== undefined ? parsed.taskReminders : true,
        });
        
        // Apply settings immediately
        document.documentElement.classList.toggle("dark", parsed.darkMode);
        document.body.classList.toggle("compact-mode", parsed.compactMode);
      } catch (err) {
        console.error("Failed to parse saved settings:", err);
      }
    }
  }, []);

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("app-settings", JSON.stringify(newSettings));

    // Apply dark mode immediately
    if (key === "darkMode") {
      document.documentElement.classList.toggle("dark", value);
    }

    // Apply compact mode immediately
    if (key === "compactMode") {
      document.body.classList.toggle("compact-mode", value);
    }

    toast({
      title: t("settingsUpdated"),
      description: t("settingsUpdatedDescription"),
    });
  };
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground">{t("settingsTitle")}</h1>
        <p className="text-muted-foreground mt-1">{t("settingsDescription")}</p>
      </div>

      <div className="grid gap-6">
        {/* Appearance Section */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-xl text-violet-600">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{t("appearance")}</CardTitle>
                <CardDescription>{t("appearanceDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t("darkMode")}</Label>
                <p className="text-sm text-muted-foreground">{t("darkModeDescription")}</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting("darkMode", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t("compactMode")}</Label>
                <p className="text-sm text-muted-foreground">{t("compactModeDescription")}</p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSetting("compactMode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{t("notifications")}</CardTitle>
                <CardDescription>{t("notificationsDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t("emailNotifications")}</Label>
                <p className="text-sm text-muted-foreground">{t("emailNotificationsDescription")}</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t("taskReminders")}</Label>
                <p className="text-sm text-muted-foreground">{t("taskRemindersDescription")}</p>
              </div>
              <Switch
                checked={settings.taskReminders}
                onCheckedChange={(checked) => updateSetting("taskReminders", checked)}
              />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
