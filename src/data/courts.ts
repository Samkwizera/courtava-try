import iprcCourtImg from "@/assets/iprc-court.jpg";
import kigaliArenaImg from "@/assets/kigali-arena.jpg";

export interface Court {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: string;
  distanceNum: number;
  rating: number;
  reviewCount: number;
  playersNow?: number;
  surface: "indoor" | "outdoor" | "cement";
  amenities: {
    lights?: boolean;
    water?: boolean;
    parking?: boolean;
  };
  description?: string;
  photos: string[];
  reviews: Review[];
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
}

// Courts in Kigali, Rwanda with real locations
export const courts: Court[] = [
  {
    id: "1",
    name: "Kigali Arena Courts",
    address: "KG 7 Ave, Kigali",
    lat: -1.9355,
    lng: 30.0928,
    distance: "0.3 km",
    distanceNum: 0.3,
    rating: 4.9,
    reviewCount: 156,
    playersNow: 8,
    surface: "indoor",
    amenities: { lights: true, water: true, parking: true },
    description: "Premium indoor basketball courts at the iconic Kigali Arena. Features professional-grade flooring, climate control, and excellent lighting for year-round play.",
    photos: [
      kigaliArenaImg,
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
      "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800",
    ],
    reviews: [
      { id: "r1", author: "Jean Pierre", rating: 5, date: "2 days ago", comment: "Best courts in Kigali! Always clean and well-maintained." },
      { id: "r2", author: "Alice M.", rating: 5, date: "1 week ago", comment: "Amazing facility. The indoor setup is perfect for all weather." },
      { id: "r3", author: "David K.", rating: 4, date: "2 weeks ago", comment: "Great courts but can get crowded on weekends." },
    ],
  },
  {
    id: "7",
    name: "IPRC Kigali Court",
    address: "KK 15 Ave, Kicukiro",
    lat: -1.9812,
    lng: 30.1067,
    distance: "2.8 km",
    distanceNum: 2.8,
    rating: 4.6,
    reviewCount: 94,
    playersNow: 5,
    surface: "outdoor",
    amenities: { lights: true, water: true, parking: true },
    description: "Popular outdoor court at IPRC Kigali. A go-to spot for students and the surrounding community with regular pickup games throughout the day.",
    photos: [
      iprcCourtImg,
      "https://images.unsplash.com/photo-1544919982-0a0c10c1c5b8?w=800",
    ],
    reviews: [
      { id: "r13", author: "Olivier N.", rating: 5, date: "1 day ago", comment: "Always a great game here. The court is well maintained and very active." },
      { id: "r14", author: "Sandra K.", rating: 4, date: "4 days ago", comment: "Good energy, lots of players. Best in the afternoon." },
      { id: "r15", author: "Thierry M.", rating: 5, date: "1 week ago", comment: "My home court. Love the competitive games here." },
    ],
  },
  {
    id: "2",
    name: "Amahoro Stadium Courts",
    address: "KG 200 St, Remera",
    lat: -1.9537,
    lng: 30.1044,
    distance: "1.2 km",
    distanceNum: 1.2,
    rating: 4.7,
    reviewCount: 203,
    playersNow: 6,
    surface: "outdoor",
    amenities: { lights: true, water: true, parking: true },
    description: "Historic outdoor courts at Amahoro National Stadium. Popular spot for pickup games with a vibrant basketball community.",
    photos: [
      "https://images.unsplash.com/photo-1544919982-0a0c10c1c5b8?w=800",
      "https://images.unsplash.com/photo-1559692048-79a3f837883d?w=800",
    ],
    reviews: [
      { id: "r4", author: "Emmanuel R.", rating: 5, date: "3 days ago", comment: "Love the atmosphere here. Great for meeting other players." },
      { id: "r5", author: "Grace N.", rating: 4, date: "1 week ago", comment: "Good courts, nice lighting for evening games." },
    ],
  },
  {
    id: "3",
    name: "Nyamirambo Courts",
    address: "KN 3 Ave, Nyamirambo",
    lat: -1.9712,
    lng: 30.0456,
    distance: "2.5 km",
    distanceNum: 2.5,
    rating: 4.5,
    reviewCount: 89,
    surface: "outdoor",
    amenities: { lights: true, water: false, parking: true },
    description: "Community outdoor courts in the heart of Nyamirambo. Known for competitive pickup games and friendly local players.",
    photos: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    reviews: [
      { id: "r6", author: "Patrick U.", rating: 5, date: "5 days ago", comment: "Great local vibe. Competitive games every evening." },
      { id: "r7", author: "Marie C.", rating: 4, date: "2 weeks ago", comment: "Nice courts, wish they had water fountains." },
    ],
  },
  {
    id: "4",
    name: "Kicukiro Community Court",
    address: "KK 15 Rd, Kicukiro",
    lat: -1.9834,
    lng: 30.1123,
    distance: "3.1 km",
    distanceNum: 3.1,
    rating: 4.3,
    reviewCount: 67,
    playersNow: 4,
    surface: "cement",
    amenities: { lights: false, water: true, parking: true },
    description: "Well-maintained cement court in Kicukiro district. Great for casual games during the day.",
    photos: [
      "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800",
    ],
    reviews: [
      { id: "r8", author: "Claude H.", rating: 4, date: "1 week ago", comment: "Solid court for the neighborhood. Clean and accessible." },
    ],
  },
  {
    id: "5",
    name: "Gisozi Sports Complex",
    address: "KG 11 Ave, Gisozi",
    lat: -1.9189,
    lng: 30.0612,
    distance: "4.0 km",
    distanceNum: 4.0,
    rating: 4.6,
    reviewCount: 112,
    surface: "outdoor",
    amenities: { lights: true, water: true, parking: false },
    description: "Modern sports complex with multiple outdoor courts. Excellent for organized games and training sessions.",
    photos: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
      "https://images.unsplash.com/photo-1544919982-0a0c10c1c5b8?w=800",
    ],
    reviews: [
      { id: "r9", author: "Yvonne M.", rating: 5, date: "4 days ago", comment: "Fantastic facility! Well-organized and clean." },
      { id: "r10", author: "Eric T.", rating: 4, date: "1 week ago", comment: "Great courts but parking can be challenging." },
    ],
  },
  {
    id: "6",
    name: "Kimihurura Basketball Court",
    address: "KG 9 Ave, Kimihurura",
    lat: -1.9445,
    lng: 30.0789,
    distance: "1.8 km",
    distanceNum: 1.8,
    rating: 4.4,
    reviewCount: 78,
    surface: "outdoor",
    amenities: { lights: true, water: false, parking: true },
    description: "Popular neighborhood court in the upscale Kimihurura area. Regular games every evening.",
    photos: [
      "https://images.unsplash.com/photo-1559692048-79a3f837883d?w=800",
    ],
    reviews: [
      { id: "r11", author: "James K.", rating: 4, date: "3 days ago", comment: "Good court with nice evening atmosphere." },
      { id: "r12", author: "Linda A.", rating: 5, date: "2 weeks ago", comment: "Love playing here! Great community." },
    ],
  },
];

export const getCourtById = (id: string): Court | undefined => {
  return courts.find((court) => court.id === id);
};
