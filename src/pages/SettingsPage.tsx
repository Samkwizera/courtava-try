import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, Globe, HelpCircle, LocateFixed, LogOut, Mail, Moon, Palette, Shield, Smartphone, Sun, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSettings, type UserSettings } from "@/hooks/useSettings";
import { useTheme, type Theme } from "@/hooks/useTheme";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const THEME_OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "Auto", Icon: Smartphone },
];

function SettingToggle({ title, description, checked, disabled, onChange }: { title: string; description: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 p-4">
    <div className="min-w-0"><p className="font-medium text-foreground">{title}</p><p className="mt-0.5 text-sm text-muted-foreground">{description}</p></div>
    <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
  </div>;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings, saveSettings, isSaving } = useSettings();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [locationPermission, setLocationPermission] = useState<PermissionState | "unsupported">("unsupported");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    if ("Notification" in window) setNotificationPermission(Notification.permission);
    if (navigator.permissions) navigator.permissions.query({ name: "geolocation" }).then((status) => {
      setLocationPermission(status.state);
      status.onchange = () => setLocationPermission(status.state);
    }).catch(() => setLocationPermission("unsupported"));
  }, []);

  const update = async (patch: Partial<UserSettings>) => {
    try {
      await saveSettings({ ...settings, ...patch });
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings");
    }
  };

  const updateNotification = async (key: keyof Pick<UserSettings, "notify_nearby_check_ins" | "notify_new_games" | "notify_communities" | "court_reminders" | "game_reminders">, enabled: boolean) => {
    if (enabled && "Notification" in window && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission !== "granted") {
        toast.error("Allow notifications in your browser to enable reminders");
        return;
      }
    }
    await update({ [key]: enabled });
  };

  const updateLocation = async (enabled: boolean) => {
    if (!enabled) {
      await update({ location_enabled: false });
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Location is not supported on this device");
      return;
    }
    setBusyAction("location");
    navigator.geolocation.getCurrentPosition(async () => {
      setLocationPermission("granted");
      await update({ location_enabled: true });
      setBusyAction(null);
    }, (error) => {
      setLocationPermission(error.code === error.PERMISSION_DENIED ? "denied" : "prompt");
      toast.error(error.code === error.PERMISSION_DENIED ? "Enable location in your browser settings" : "Could not access your location");
      setBusyAction(null);
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const deleteAccount = async () => {
    setBusyAction("delete");
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      setBusyAction(null);
      toast.error(error.message.includes("function") ? "Apply the local settings migration before deleting accounts" : error.message);
      return;
    }
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return <div className="min-h-[100dvh] bg-background pb-28">
    <PageHeader title="Settings" back="/profile" />
    <div className="mx-auto w-full max-w-2xl p-4">
      <Section label="Account" grouped>
        <div className="flex items-center gap-3 p-4"><Mail className="h-5 w-5 shrink-0 text-primary" /><div className="min-w-0"><p className="font-medium">Email</p><p className="truncate text-sm text-muted-foreground">{user?.email || "No email available"}</p></div></div>
      </Section>

      <Section label="Notifications" grouped>
        <div className="flex items-center gap-3 p-4"><Bell className="h-5 w-5 text-primary" /><div><p className="font-medium">Browser permission</p><p className="text-sm capitalize text-muted-foreground">{notificationPermission}</p></div></div>
        <SettingToggle title="Nearby check-ins" description="When players become active nearby" checked={settings.notify_nearby_check_ins} disabled={isSaving} onChange={(value) => updateNotification("notify_nearby_check_ins", value)} />
        <SettingToggle title="New games" description="New games and important updates" checked={settings.notify_new_games} disabled={isSaving} onChange={(value) => updateNotification("notify_new_games", value)} />
        <SettingToggle title="Community activity" description="Updates from your basketball communities" checked={settings.notify_communities} disabled={isSaving} onChange={(value) => updateNotification("notify_communities", value)} />
        <SettingToggle title="Court reminders" description="Activity reminders for followed courts" checked={settings.court_reminders} disabled={isSaving} onChange={(value) => updateNotification("court_reminders", value)} />
        <SettingToggle title="Game reminders" description="Reminders for games you joined or host" checked={settings.game_reminders} disabled={isSaving} onChange={(value) => updateNotification("game_reminders", value)} />
      </Section>

      <Section label="Location" grouped>
        <div className="flex items-center gap-3 p-4"><LocateFixed className="h-5 w-5 text-primary" /><div><p className="font-medium">Location permission</p><p className="text-sm capitalize text-muted-foreground">{locationPermission}</p></div></div>
        <SettingToggle title="Use my location" description="Show distance and nearby court activity" checked={settings.location_enabled} disabled={isSaving || busyAction === "location"} onChange={updateLocation} />
      </Section>

      <Section label="Appearance" grouped>
        <div className="flex items-center gap-3 p-4"><Palette className="h-5 w-5 text-primary" /><div><p className="font-medium">Theme</p><p className="text-sm text-muted-foreground">Match your device or choose a mode</p></div></div>
        <div role="radiogroup" aria-label="Theme" className="flex gap-2 px-4 pb-4">{THEME_OPTIONS.map(({ value, label, Icon }) => <button key={value} type="button" role="radio" aria-checked={theme === value} onClick={() => setTheme(value)} className={`ios-tap flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 ${theme === value ? "border-primary bg-secondary text-secondary-foreground" : "border-border bg-background text-muted-foreground"}`}><Icon className="h-5 w-5" /><span className="text-[13px] font-semibold">{label}</span></button>)}</div>
      </Section>

      <Section label="Privacy and help" grouped>
        <button type="button" onClick={() => navigate("/privacy")} className="ios-tap flex w-full items-center justify-between p-4 text-left hover:bg-muted/40"><span className="flex items-center gap-3"><Shield className="h-5 w-5 text-primary" /><span className="font-medium">Privacy policy</span></span><ChevronRight className="h-5 w-5 text-muted-foreground" /></button>
        <button type="button" onClick={() => navigate("/terms")} className="ios-tap flex w-full items-center justify-between p-4 text-left hover:bg-muted/40"><span className="flex items-center gap-3"><Globe className="h-5 w-5 text-primary" /><span className="font-medium">Terms of use</span></span><ChevronRight className="h-5 w-5 text-muted-foreground" /></button>
        <button type="button" onClick={() => navigate("/support")} className="ios-tap flex w-full items-center justify-between p-4 text-left hover:bg-muted/40"><span className="flex items-center gap-3"><HelpCircle className="h-5 w-5 text-primary" /><span className="font-medium">Help and support</span></span><ChevronRight className="h-5 w-5 text-muted-foreground" /></button>
      </Section>

      <Section label="Session" grouped>
        <AlertDialog><AlertDialogTrigger asChild><button type="button" className="ios-tap flex w-full items-center justify-between p-4 text-left hover:bg-muted/40"><span className="flex items-center gap-3"><LogOut className="h-5 w-5 text-amber-600" /><span className="font-medium">Sign out</span></span><ChevronRight className="h-5 w-5 text-muted-foreground" /></button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Sign out?</AlertDialogTitle><AlertDialogDescription>You will need to sign in again to access your account.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleSignOut}>Sign out</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        <AlertDialog><AlertDialogTrigger asChild><button type="button" className="ios-tap flex w-full items-center justify-between p-4 text-left hover:bg-destructive/10"><span className="flex items-center gap-3"><Trash2 className="h-5 w-5 text-destructive" /><span className="font-medium text-destructive">Delete account</span></span><ChevronRight className="h-5 w-5 text-muted-foreground" /></button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Permanently delete your account?</AlertDialogTitle><AlertDialogDescription>Your profile, hosted games, participation, check-ins, and communities will be removed. This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction disabled={busyAction === "delete"} onClick={deleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete permanently</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      </Section>

      <div className="py-3 text-center text-xs text-muted-foreground"><p>Courtava v{__APP_VERSION__}</p><p className="mt-1">© {new Date().getFullYear()} Courtava. All rights reserved.</p></div>
    </div>
  </div>;
}
