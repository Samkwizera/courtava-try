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
  {
    id: "8",
    name: "Club Rafiki",
    address: "Avenue de la Nyabarongo, Nyamirambo",
    lat: -1.97154,
    lng: 30.05583,
    distance: "2.9 km",
    distanceNum: 2.9,
    rating: 5.0,
    reviewCount: 41,
    playersNow: 7,
    surface: "cement",
    amenities: { lights: true, water: false, parking: true },
    description: "Public outdoor courts at Club Rafiki in Nyamirambo. Known for multiple hoops, concrete surface, lighting, and a strong local pickup scene.",
    photos: [
      "https://images.unsplash.com/photo-1544919982-0a0c10c1c5b8?w=800",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    reviews: [
      { id: "r16", author: "Kevin M.", rating: 5, date: "3 days ago", comment: "Classic Kigali court. Evening games are competitive." },
      { id: "r17", author: "Aline U.", rating: 5, date: "1 week ago", comment: "Great energy and easy to find in Nyamirambo." },
    ],
  },
  {
    id: "9",
    name: "Kabusunzu Primary School Court",
    address: "Avenue du Mont Kigali, Kabusunzu",
    lat: -1.9635701,
    lng: 30.053885,
    distance: "3.2 km",
    distanceNum: 3.2,
    rating: 4.1,
    reviewCount: 23,
    surface: "outdoor",
    amenities: { lights: false, water: false, parking: false },
    description: "Neighborhood outdoor school court in Kabusunzu. A practical daytime option for casual runs and shooting practice.",
    photos: [
      "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800",
    ],
    reviews: [
      { id: "r18", author: "Moses N.", rating: 4, date: "1 week ago", comment: "Simple court but useful for nearby players." },
    ],
  },
  {
    id: "10",
    name: "Institute of Science, Technology and Management Court",
    address: "Avenue de l'Armee, Kigali",
    lat: -1.96232,
    lng: 30.06876,
    distance: "2.4 km",
    distanceNum: 2.4,
    rating: 4.2,
    reviewCount: 31,
    surface: "outdoor",
    amenities: { lights: false, water: false, parking: true },
    description: "Outdoor court near the Institute of Science, Technology and Management area. Good central option close to Kiyovu and Nyarugenge.",
    photos: [
      "https://images.unsplash.com/photo-1559692048-79a3f837883d?w=800",
    ],
    reviews: [
      { id: "r19", author: "Cedric I.", rating: 4, date: "2 weeks ago", comment: "Convenient central location for quick games." },
    ],
  },
  {
    id: "11",
    name: "Petit Stade",
    address: "KG 11 Ave, Remera",
    lat: -1.9565945,
    lng: 30.1135471,
    distance: "1.7 km",
    distanceNum: 1.7,
    rating: 4.8,
    reviewCount: 124,
    playersNow: 6,
    surface: "indoor",
    amenities: { lights: true, water: true, parking: true },
    description: "Established indoor competition venue in Remera that hosts major basketball games and training sessions.",
    photos: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
      "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800",
    ],
    reviews: [
      { id: "r20", author: "Noella B.", rating: 5, date: "2 days ago", comment: "One of the best indoor basketball venues in Kigali." },
      { id: "r21", author: "Chris R.", rating: 5, date: "1 week ago", comment: "Great lighting and proper competition feel." },
    ],
  },
  {
    id: "12",
    name: "LDK Gymnasium",
    address: "Lycee de Kigali, Kiyovu",
    lat: -1.96232,
    lng: 30.06876,
    distance: "2.5 km",
    distanceNum: 2.5,
    rating: 5.0,
    reviewCount: 54,
    surface: "indoor",
    amenities: { lights: true, water: true, parking: true },
    description: "Indoor gymnasium at Lycee de Kigali with a strong school and competition basketball history.",
    photos: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    ],
    reviews: [
      { id: "r22", author: "Jean Claude", rating: 5, date: "4 days ago", comment: "Reliable indoor court and good for organized runs." },
    ],
  },
  {
    id: "13",
    name: "Fitness Point Basketball Court",
    address: "24W6+6R3, Remera",
    lat: -1.9544375,
    lng: 30.1120625,
    distance: "1.5 km",
    distanceNum: 1.5,
    rating: 4.4,
    reviewCount: 38,
    playersNow: 3,
    surface: "cement",
    amenities: { lights: false, water: false, parking: true },
    description: "Outdoor full court near Remera with a concrete surface and regular pickup activity.",
    photos: [
      "https://images.unsplash.com/photo-1544919982-0a0c10c1c5b8?w=800",
    ],
    reviews: [
      { id: "r23", author: "Patrick D.", rating: 4, date: "5 days ago", comment: "Good outdoor run. Usually active after work." },
    ],
  },
  {
    id: "14",
    name: "Africa Leadership University Basketball Court",
    address: "3572+WP2, Kigali",
    lat: -1.9351875,
    lng: 30.1518125,
    distance: "5.8 km",
    distanceNum: 5.8,
    rating: 4.5,
    reviewCount: 42,
    surface: "cement",
    amenities: { lights: false, water: true, parking: true },
    description: "Outdoor school court at Africa Leadership University with full-court pickup potential and a concrete playing surface.",
    photos: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    reviews: [
      { id: "r24", author: "Ishimwe T.", rating: 5, date: "1 week ago", comment: "Clean court and good student pickup games." },
    ],
  },
  {
    id: "15",
    name: "Carnegie Mellon University Basketball Court",
    address: "3575+HQ, Kigali",
    lat: -1.9360625,
    lng: 30.1594375,
    distance: "6.4 km",
    distanceNum: 6.4,
    rating: 4.3,
    reviewCount: 29,
    surface: "cement",
    amenities: { lights: false, water: true, parking: true },
    description: "Outdoor university court at Carnegie Mellon University Africa, suitable for casual games and student pickup runs.",
    photos: [
      "https://images.unsplash.com/photo-1544919982-0a0c10c1c5b8?w=800",
    ],
    reviews: [
      { id: "r25", author: "Divine A.", rating: 4, date: "2 weeks ago", comment: "Nice campus court and easy to organize games." },
    ],
  },
  {
    id: "16",
    name: "Zaria Court Kigali",
    address: "KG 17 Ave, Remera",
    lat: -1.9369,
    lng: 30.0941,
    distance: "0.5 km",
    distanceNum: 0.5,
    rating: 4.9,
    reviewCount: 68,
    playersNow: 5,
    surface: "indoor",
    amenities: { lights: true, water: true, parking: true },
    description: "New multi-purpose sports hub in Remera with a court designed for basketball, fitness, events, and community play.",
    photos: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    ],
    reviews: [
      { id: "r26", author: "Mugisha E.", rating: 5, date: "2 days ago", comment: "Modern setup and easy to reserve." },
      { id: "r27", author: "Diane K.", rating: 5, date: "6 days ago", comment: "Great new option near BK Arena." },
    ],
  },
  {
    id: "17",
    name: "Saint Ignatius GOA Courts",
    address: "KG 19 Ave, Kibagabaga",
    lat: -1.93686,
    lng: 30.11909,
    distance: "2.6 km",
    distanceNum: 2.6,
    rating: 4.7,
    reviewCount: 36,
    playersNow: 4,
    surface: "outdoor",
    amenities: { lights: true, water: true, parking: true },
    description: "Three outdoor Giants of Africa courts at Saint Ignatius School in Kibagabaga, adding a strong youth basketball option near Remera.",
    photos: [
      "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800",
    ],
    reviews: [
      { id: "r28", author: "Aime N.", rating: 5, date: "3 days ago", comment: "Fresh courts and a good youth basketball atmosphere." },
    ],
  },
];

export const getCourtById = (id: string): Court | undefined => {
  return courts.find((court) => court.id === id);
};
