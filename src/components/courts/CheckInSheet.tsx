import { MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useCheckIns, CheckIn } from "@/hooks/useCheckIns";
import { useNavigate } from "react-router-dom";
import { haptic } from "@/lib/haptics";

interface CheckInSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courtId: string;
  courtName: string;
  checkedInUsers: CheckIn[];
}

export function CheckInSheet({
  open,
  onOpenChange,
  courtId,
  courtName,
  checkedInUsers,
}: CheckInSheetProps) {
  const { user } = useAuth();
  const { myCheckIn, checkIn, checkOut } = useCheckIns();
  const navigate = useNavigate();

  const isCheckedInHere = myCheckIn?.court_id === courtId;

  const handleCheckIn = async () => {
    if (!user) {
      onOpenChange(false);
      navigate("/auth");
      return;
    }

    await checkIn(courtId);
    haptic("success");
    onOpenChange(false);
  };

  const handleCheckOut = async () => {
    await checkOut();
    haptic("selection");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {courtName}
          </SheetTitle>
          <SheetDescription>
            {checkedInUsers.length > 0
              ? `${checkedInUsers.length} player${checkedInUsers.length > 1 ? "s" : ""} here now`
              : "No one checked in yet"}
          </SheetDescription>
        </SheetHeader>

        {/* Checked in users */}
        {checkedInUsers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Players at this court</h4>
            <div className="flex flex-wrap gap-3">
              {checkedInUsers.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-full"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {(checkIn.profile?.display_name || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {checkIn.profile?.display_name || "Player"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check in/out button */}
        <div className="space-y-3">
          {!user ? (
            <Button className="w-full" onClick={() => navigate("/auth")}>
              Sign in to check in
            </Button>
          ) : isCheckedInHere ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleCheckOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Check Out
            </Button>
          ) : (
            <Button className="w-full" onClick={handleCheckIn}>
              <MapPin className="w-4 h-4 mr-2" />
              Check In Here
            </Button>
          )}

          {myCheckIn && !isCheckedInHere && (
            <p className="text-xs text-muted-foreground text-center">
              You're currently checked in at another court
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
