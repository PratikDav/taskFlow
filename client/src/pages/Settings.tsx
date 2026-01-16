import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, Palette, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [settings, setSettings] = useState({
    darkMode: false,
    compactMode: false,
    emailNotifications: true,
    taskReminders: true,
    language: "en",
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("app-settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
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

    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved.",
    });
  };
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and workspace settings.</p>
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
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the app looks.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Enable dark mode for the interface.</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting("darkMode", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce spacing in lists and tables.</p>
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
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Control when you get notified.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive daily summaries via email.</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Task Reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified when a task is due.</p>
              </div>
              <Switch
                checked={settings.taskReminders}
                onCheckedChange={(checked) => updateSetting("taskReminders", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Section */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl text-green-600">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Language</CardTitle>
                <CardDescription>Choose your preferred language.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Interface Language</Label>
                <p className="text-sm text-muted-foreground">Select the language for the app interface.</p>
              </div>
              <Select
                value={settings.language}
                onValueChange={(value) => updateSetting("language", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
