export type Event = {
  id: string;
  title: string;
  artist: string;
  venue: string;
  city: string;
  date: string;
  price: number;
  gradient: string; // tailwind gradient classes
  tag: string;
};

export type Artist = {
  id: string;
  name: string;
  genre: string;
  nextShow: string;
  initial: string;
  gradient: string;
};

export const artists: Artist[] = [
  { id: "a1", name: "NOVA PROTOCOL", genre: "Electronic", nextShow: "Nov 14", initial: "N", gradient: "from-cyan-500/20 to-blue-600/20" },
  { id: "a2", name: "Elena Vasquez", genre: "Indie Rock", nextShow: "Nov 18", initial: "E", gradient: "from-pink-500/20 to-orange-500/20" },
  { id: "a3", name: "KAIROS", genre: "Techno", nextShow: "Nov 22", initial: "K", gradient: "from-purple-500/20 to-cyan-500/20" },
  { id: "a4", name: "The Midnight Bloom", genre: "Synthpop", nextShow: "Dec 01", initial: "M", gradient: "from-red-500/20 to-purple-600/20" },
  { id: "a5", name: "Aki Tanaka", genre: "Ambient", nextShow: "Dec 05", initial: "A", gradient: "from-emerald-500/20 to-teal-500/20" },
  { id: "a6", name: "BINARY SAINTS", genre: "Post-Punk", nextShow: "Dec 09", initial: "B", gradient: "from-yellow-500/20 to-red-500/20" },
  { id: "a7", name: "Cassette Dreams", genre: "Lo-fi", nextShow: "Dec 12", initial: "C", gradient: "from-indigo-500/20 to-pink-500/20" },
  { id: "a8", name: "HALO.EXE", genre: "Glitch", nextShow: "Dec 18", initial: "H", gradient: "from-green-500/20 to-blue-500/20" },
];

export const events: Event[] = [
  {
    id: "e1",
    title: "Protocol: Live in NYC",
    artist: "NOVA PROTOCOL",
    venue: "Terminal 5",
    city: "New York, NY",
    date: "Nov 14, 2026 · 8:00 PM",
    price: 100,
    gradient: "from-cyan-600/30 via-blue-600/20 to-slate-900",
    tag: "TONIGHT",
  },
  {
    id: "e2",
    title: "Vasquez: Solstice Tour",
    artist: "Elena Vasquez",
    venue: "Bowery Ballroom",
    city: "New York, NY",
    date: "Nov 18, 2026 · 9:00 PM",
    price: 100,
    gradient: "from-pink-600/30 via-orange-500/20 to-slate-900",
    tag: "THIS WEEK",
  },
  {
    id: "e3",
    title: "KAIROS — Null State",
    artist: "KAIROS",
    venue: "Brooklyn Mirage",
    city: "Brooklyn, NY",
    date: "Nov 22, 2026 · 10:00 PM",
    price: 100,
    gradient: "from-purple-600/30 via-cyan-600/20 to-slate-900",
    tag: "POPULAR",
  },
  {
    id: "e4",
    title: "Midnight Bloom Live",
    artist: "The Midnight Bloom",
    venue: "Webster Hall",
    city: "New York, NY",
    date: "Dec 01, 2026 · 8:30 PM",
    price: 100,
    gradient: "from-red-600/30 via-purple-600/20 to-slate-900",
    tag: "NEW",
  },
  {
    id: "e5",
    title: "Tanaka: Ambient Field",
    artist: "Aki Tanaka",
    venue: "National Sawdust",
    city: "Brooklyn, NY",
    date: "Dec 05, 2026 · 7:00 PM",
    price: 100,
    gradient: "from-emerald-600/30 via-teal-600/20 to-slate-900",
    tag: "INTIMATE",
  },
  {
    id: "e6",
    title: "BINARY SAINTS x Void",
    artist: "BINARY SAINTS",
    venue: "Elsewhere",
    city: "Brooklyn, NY",
    date: "Dec 09, 2026 · 9:30 PM",
    price: 100,
    gradient: "from-yellow-600/30 via-red-600/20 to-slate-900",
    tag: "LOUD",
  },
  {
    id: "e7",
    title: "Cassette Dreams Acoustic",
    artist: "Cassette Dreams",
    venue: "Mercury Lounge",
    city: "New York, NY",
    date: "Dec 12, 2026 · 8:00 PM",
    price: 100,
    gradient: "from-indigo-600/30 via-pink-600/20 to-slate-900",
    tag: "ACOUSTIC",
  },
  {
    id: "e8",
    title: "HALO.EXE — Runtime",
    artist: "HALO.EXE",
    venue: "Knockdown Center",
    city: "Queens, NY",
    date: "Dec 18, 2026 · 11:00 PM",
    price: 100,
    gradient: "from-green-600/30 via-blue-600/20 to-slate-900",
    tag: "LATE",
  },
];

export function getEvent(id: string): Event | undefined {
  return events.find((e) => e.id === id);
}
