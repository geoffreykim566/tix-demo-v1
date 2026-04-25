"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import { store } from "@/lib/store";
import { artists, events } from "@/lib/mockData";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = store.getUser();
    const wallet = store.getWallet();
    if (!user) router.replace("/login");
    else if (!user.kycVerified) router.replace("/kyc");
    else if (!wallet) router.replace("/wallet/create");
  }, [router]);

  return (
    <div className="min-h-screen">
      <TopNav />

      <div className="grid-bg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="font-mono text-xs text-accent tracking-[0.2em] mb-3">
            [ DISCOVER · NEW YORK, NY ]
          </div>
          <h1 className="text-4xl font-semibold tracking-tight mb-1">
            Live this month.
          </h1>
          <p className="text-fg-dim">
            Tokenized tickets. Real ownership. Resell any time.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-14">
        {/* Artists row */}
        <ScrollRow
          kicker="[ 01 ]"
          title="Artists performing near you"
          subtitle="Touring through NYC in the next 30 days"
        >
          {artists.map((a) => (
            <Link
              key={a.id}
              href={`/home#${a.id}`}
              className="shrink-0 w-[180px] group"
            >
              <div
                className={`aspect-square rounded-lg bg-gradient-to-br ${a.gradient} border border-border group-hover:border-accent transition-all relative overflow-hidden noise`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-6xl font-bold text-fg/80 group-hover:text-accent transition-colors">
                    {a.initial}
                  </span>
                </div>
                <div className="absolute top-2 left-2 font-mono text-[9px] text-fg-dim tracking-wider">
                  {a.genre.toUpperCase()}
                </div>
                <div className="absolute bottom-2 right-2 font-mono text-[9px] text-accent">
                  {a.nextShow}
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm font-medium truncate group-hover:text-accent transition-colors">
                  {a.name}
                </div>
                <div className="text-xs text-fg-dim">{a.genre}</div>
              </div>
            </Link>
          ))}
        </ScrollRow>

        {/* Concerts row */}
        <ScrollRow
          kicker="[ 02 ]"
          title="Concerts near you"
          subtitle="Tickets available at face value"
        >
          {events.map((ev) => (
            <Link
              key={ev.id}
              href={`/event/${ev.id}`}
              className="shrink-0 w-[300px] group"
            >
              <div
                className={`aspect-[4/3] rounded-lg bg-gradient-to-br ${ev.gradient} border border-border group-hover:border-accent transition-all relative overflow-hidden noise`}
              >
                <div className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.2em] bg-bg/60 backdrop-blur-sm border border-border rounded px-2 py-1 text-accent">
                  {ev.tag}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-bg to-transparent">
                  <div className="font-mono text-[10px] text-fg-dim tracking-wider mb-1">
                    {ev.date.toUpperCase()}
                  </div>
                  <div className="text-lg font-semibold leading-tight mb-0.5">
                    {ev.title}
                  </div>
                  <div className="text-xs text-fg-dim">
                    {ev.venue} · {ev.city}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{ev.artist}</div>
                  <div className="text-xs text-fg-dim">from ${ev.price}</div>
                </div>
                <div className="font-mono text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  buy →
                </div>
              </div>
            </Link>
          ))}
        </ScrollRow>

        {/* Secondary market row */}
        <ScrollRow
          kicker="[ 03 ]"
          title="Resale market"
          subtitle="Tickets listed by other users · peer-to-peer"
        >
          {events.slice(2, 7).map((ev, i) => (
            <Link
              key={ev.id + "-resale"}
              href={`/event/${ev.id}`}
              className="shrink-0 w-[280px] group"
            >
              <div className="bg-bg-card border border-border rounded-lg p-4 group-hover:border-accent transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded bg-gradient-to-br ${ev.gradient} border border-border`}
                  />
                  <div className="font-mono text-[9px] text-accent tracking-wider">
                    {(85 + i * 12)} USD
                  </div>
                </div>
                <div className="text-sm font-medium mb-1 truncate">{ev.title}</div>
                <div className="text-xs text-fg-dim mb-3">
                  {ev.venue} · {ev.date.split("·")[0]}
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-fg-faint border-t border-border-soft pt-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                  <span>
                    0x{(i * 12345).toString(16).padEnd(4, "a")}...
                    {(i * 98765).toString(16).slice(0, 4)}
                  </span>
                  <span className="ml-auto">SECTION 100+</span>
                </div>
              </div>
            </Link>
          ))}
        </ScrollRow>

        <div className="font-mono text-[10px] text-fg-faint text-center tracking-wider pt-8 border-t border-border-soft">
          [ END OF FEED · PULL TO REFRESH ]
        </div>
      </div>
    </div>
  );
}

function ScrollRow({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * 500, behavior: "smooth" });
  };
  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="font-mono text-xs text-accent tracking-[0.2em] mb-2">
            {kicker}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-fg-dim mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => scroll(-1)}
            className="w-8 h-8 border border-border hover:border-accent hover:text-accent rounded text-fg-dim font-mono text-sm transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-8 h-8 border border-border hover:border-accent hover:text-accent rounded text-fg-dim font-mono text-sm transition-colors"
          >
            →
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth"
      >
        {children}
      </div>
    </section>
  );
}
