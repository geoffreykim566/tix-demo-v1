// Client-side state persistence. No backend, no real crypto — this is a demo.

export type User = {
  username: string;
  email: string;
  createdAt: number;
  kycVerified: boolean;
};

export type Wallet = {
  address: string; // looks like 0x...
  createdAt: number;
  balanceUsd: number;
};

export type Ticket = {
  id: string;
  eventId: string;
  eventTitle: string;
  artist: string;
  venue: string;
  date: string;
  section: string;
  row: string;
  seat: string;
  purchasePrice: number;
  tokenId: string; // fake on-chain token id
  forSale: boolean;
  resalePrice: number | null;
};

const KEYS = {
  user: "tix:user",
  wallet: "tix:wallet",
  tickets: "tix:tickets",
} as const;

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export const store = {
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    return safeParse<User>(localStorage.getItem(KEYS.user));
  },
  setUser(u: User) {
    localStorage.setItem(KEYS.user, JSON.stringify(u));
  },
  clearUser() {
    localStorage.removeItem(KEYS.user);
  },

  getWallet(): Wallet | null {
    if (typeof window === "undefined") return null;
    return safeParse<Wallet>(localStorage.getItem(KEYS.wallet));
  },
  setWallet(w: Wallet) {
    localStorage.setItem(KEYS.wallet, JSON.stringify(w));
  },

  getTickets(): Ticket[] {
    if (typeof window === "undefined") return [];
    return safeParse<Ticket[]>(localStorage.getItem(KEYS.tickets)) ?? [];
  },
  addTicket(t: Ticket) {
    const tickets = store.getTickets();
    tickets.push(t);
    localStorage.setItem(KEYS.tickets, JSON.stringify(tickets));
  },
  updateTicket(id: string, patch: Partial<Ticket>) {
    const tickets = store.getTickets();
    const idx = tickets.findIndex((t) => t.id === id);
    if (idx === -1) return;
    tickets[idx] = { ...tickets[idx], ...patch };
    localStorage.setItem(KEYS.tickets, JSON.stringify(tickets));
  },

  reset() {
    localStorage.removeItem(KEYS.user);
    localStorage.removeItem(KEYS.wallet);
    localStorage.removeItem(KEYS.tickets);
  },
};

// fake wallet generators
export function generateWalletAddress(): string {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
  return addr;
}

export function generateSeedPhrase(): string[] {
  const words = [
    "ember", "cipher", "quartz", "lunar", "vector", "rogue", "oracle", "pixel",
    "shadow", "nebula", "vortex", "prism", "glitch", "stellar", "crypt", "binary",
    "phantom", "circuit", "matrix", "zenith", "horizon", "parallax", "orbit", "flux",
  ];
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 12);
}

export function generateTokenId(): string {
  return Math.floor(Math.random() * 1_000_000).toString().padStart(6, "0");
}

export function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
