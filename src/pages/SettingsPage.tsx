import {
  ChevronLeft,
  Bell,
  Lock,
  Globe,
  HelpCircle,
  Shield,
  LogOut,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [notifications, setNotifications] = useState({
    checkIns: true,
    newGames: true,
    messages: false,
    communities: true,
  });

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "Notification Settings Updated",
      description: "Your preferences have been saved",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "This feature will be available soon",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background safe-top pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Notifications Section */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            Notifications
          </h2>
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Check-ins</p>
                  <p className="text-sm text-muted-foreground">
                    When players check in nearby
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications.checkIns}
                onCheckedChange={() => handleNotificationToggle("checkIns")}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">New Games</p>
                  <p className="text-sm text-muted-foreground">
                    Game invitations and updates
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications.newGames}
                onCheckedChange={() => handleNotificationToggle("newGames")}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Messages</p>
                  <p className="text-sm text-muted-foreground">
                    Direct messages from players
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications.messages}
                onCheckedChange={() => handleNotificationToggle("messages")}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Communities</p>
                  <p className="text-sm text-muted-foreground">
                    Community activity and events
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications.communities}
                onCheckedChange={() => handleNotificationToggle("communities")}
              />
            </div>
          </div>
        </section>

        {/* Privacy & Security Section */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            Privacy & Security
          </h2>
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden divide-y divide-border">
            <button
              type="button"
              onClick={() =>
                toast({
                  title: "Privacy Settings",
                  description: "Coming soon!",
                })
              }
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <p className="font-medium text-foreground">Privacy</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() =>
                toast({
                  title: "Change Password",
                  description: "Coming soon!",
                })
              }
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <p className="font-medium text-foreground">Change Password</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* General Section */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            General
          </h2>
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden divide-y divide-border">
            <button
              type="button"
              onClick={() =>
                toast({
                  title: "Language",
                  description: "Coming soon!",
                })
              }
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-foreground">Language</p>
                  <p className="text-sm text-muted-foreground">English</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() =>
                toast({
                  title: "Help & Support",
                  description: "Coming soon!",
                })
              }
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-primary" />
                <p className="font-medium text-foreground">Help & Support</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Account Actions Section */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            Account
          </h2>
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden divide-y divide-border">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-orange-500" />
                    <p className="font-medium text-foreground">Sign Out</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign Out</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out? You'll need to sign in
                    again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut}>
                    Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 hover:bg-destructive/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-destructive" />
                    <p className="font-medium text-destructive">
                      Delete Account
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>CourtAva v1.0.0</p>
          <p className="mt-1">© 2026 CourtAva. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
