import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Users, Sun, Droplets, Car, Navigation, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getCourtById } from "@/data/courts";

export default function CourtDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const court = getCourtById(id || "");

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
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
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

      {/* Photo gallery */}
      <div className="relative">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {court.photos.map((photo, index) => (
            <div key={index} className="min-w-full snap-center">
              <img
                src={photo}
                alt={`${court.name} photo ${index + 1}`}
                className="w-full h-56 object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {court.photos.length} photos
        </div>
        
        {/* Live players indicator */}
        {court.playersNow && court.playersNow > 0 && (
          <div className="absolute top-3 right-3">
            <Badge variant="live" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {court.playersNow} playing now
            </Badge>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="px-4 py-4">
        {/* Title and rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h2 className="text-xl font-bold text-foreground">{court.name}</h2>
            <Badge variant="secondary" className="capitalize mt-1">
              {court.surface}
            </Badge>
          </div>
          <div className="flex items-center gap-1 shrink-0 bg-secondary px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 fill-court-orange text-court-orange" />
            <span className="font-semibold">{court.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              ({court.reviewCount})
            </span>
          </div>
        </div>

        {/* Address and distance */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 shrink-0" />
          <span>{court.address}</span>
          <span>• {court.distance}</span>
        </div>

        {/* Description */}
        {court.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {court.description}
          </p>
        )}

        {/* Amenities */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${court.amenities.lights ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <Sun className="w-4 h-4" />
              <span className="text-sm">Lights</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${court.amenities.water ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <Droplets className="w-4 h-4" />
              <span className="text-sm">Water</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${court.amenities.parking ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <Car className="w-4 h-4" />
              <span className="text-sm">Parking</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Reviews ({court.reviews.length})
            </h3>
            <Button variant="ghost" size="sm">
              Write a review
            </Button>
          </div>

          <div className="space-y-4">
            {court.reviews.map((review) => (
              <div key={review.id} className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-secondary text-xs">
                    {review.author.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{review.author}</span>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < review.rating ? 'fill-court-orange text-court-orange' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4 z-30">
        <Button className="w-full" size="lg" onClick={handleGetDirections}>
          <Navigation className="w-5 h-5 mr-2" />
          Get Directions
        </Button>
      </div>
    </div>
  );
}
