import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Users, Sun, Droplets, Car, Navigation, Share2, Heart, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useCourts } from "@/hooks/useCourts";
import { useAuth } from "@/hooks/useAuth";
import { useCheckIns } from "@/hooks/useCheckIns";

export default function CourtDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dbCourts, isLoading } = useCourts();
  const { checkIns, myCheckIn, checkIn, checkOut } = useCheckIns();

  const court = dbCourts.find((c) => c.id === id);
  const courtCheckIns = checkIns.filter((c) => c.court_id === id);
  const isCheckedInHere = myCheckIn?.court_id === id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!court) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Court not found</h1>
          <Button onClick={() => navigate("/courts")}>Back to Courts</Button>
        </div>
      </div>
    );
  }

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`;
    window.open(url, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: court.name,
        text: `Check out ${court.name} on Courtava!`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with back button */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold line-clamp-1">{court.name}</h1>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Court image placeholder */}
      <div className="relative h-48 bg-muted">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-24 h-16 rounded-md bg-muted-foreground/10 border border-muted-foreground/20 relative">
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-muted-foreground/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border border-muted-foreground/30" />
            </div>
          </div>
        </div>

        {courtCheckIns.length > 0 && (
          <div className="absolute top-3 right-3">
            <Badge variant="live" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {courtCheckIns.length} playing now
            </Badge>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="px-4 py-4">
        {/* Title */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h2 className="text-xl font-bold text-foreground">{court.name}</h2>
            <Badge variant="secondary" className="capitalize mt-1">
              {court.surface}
            </Badge>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 shrink-0" />
          <span>{court.address}</span>
        </div>

        {/* Amenities */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${court.lights ? "bg-muted text-foreground" : "bg-muted text-muted-foreground"}`}>
              <Sun className="w-4 h-4" />
              <span className="text-sm">Lights</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${court.water ? "bg-muted text-foreground" : "bg-muted text-muted-foreground"}`}>
              <Droplets className="w-4 h-4" />
              <span className="text-sm">Water</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${court.parking ? "bg-muted text-foreground" : "bg-muted text-muted-foreground"}`}>
              <Car className="w-4 h-4" />
              <span className="text-sm">Parking</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />
      </div>

      {/* Checked-in users section */}
      {courtCheckIns.length > 0 && (
        <div className="px-4 pb-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Players here now ({courtCheckIns.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {courtCheckIns.map((ci) => (
              <div
                key={ci.id}
                className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-full"
              >
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {(ci.profile?.display_name || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {ci.profile?.display_name || "Player"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4 z-30">
        <div className="flex gap-3">
          {!user ? (
            <Button className="flex-1" size="lg" onClick={() => navigate("/auth")}>
              <LogIn className="w-5 h-5 mr-2" />
              Sign in to Check In
            </Button>
          ) : isCheckedInHere ? (
            <Button variant="secondary" className="flex-1" size="lg" onClick={() => checkOut()}>
              Check Out
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" size="lg" onClick={() => checkIn(id!)}>
              <MapPin className="w-5 h-5 mr-2" />
              Check In
            </Button>
          )}
          <Button className="flex-1" size="lg" onClick={handleGetDirections}>
            <Navigation className="w-5 h-5 mr-2" />
            Directions
          </Button>
        </div>
      </div>
    </div>
  );
}
