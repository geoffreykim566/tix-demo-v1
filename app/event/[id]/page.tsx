"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import { getEvent, events } from "@/lib/mockData";
import { store } from "@/lib/store";

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const event = getEvent(id);
  const [selectedSection, setSelectedSection] = useState("GA");

  useEffect(() => {
    const u = store.getUser();
    if (!u) router.replace("/login");
  }, [router]);

  if (!event) {
    return (
      <div className="min-h-screen">
        <TopNav />
        <div className="max-w-4xl mx-auto p-6 text-fg-dim">Event not found.</div>
      </div>
    );
  }

  const sections = [
    { name: "GA", price: event.price, note: "General Admission" },
    { name: "MEZZ", price: event.price + 50, note: "Mezzanine · Reserved" },
    { name: "VIP", price: event.price + 180, note: "VIP · Close to stage" },
  ];
  const selected = sections.find((s) => s.name === selectedSection)!;

  const goCheckout = () => {
    router.push(`/checkout/${event.id}?section=${selectedSection}&price=${selected.price}`);
  };

  const otherEvents = events.filter((e) => e.id !== event.id).slice(0, 3);

  return (
    <div className="min-h-screen">
      <TopNav />

      {/* Hero */}
      <div className={`relative border-b border-border bg-gradient-to-br ${event.gradient} noise`}>
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <button
            onClick={() => router.back()}
            className="font-mono text-xs text-fg-dim hover:text-accent mb-8 transition-colors"
          >
            ← Back
          </button>
          <div className="font-mono text-xs text-accent tracking-[0.2em] mb-3 inline-block border border-accent/40 rounded px-2 py-1">
            {event.tag}
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-3">
            {event.title}
          </h1>
          <div className="text-xl text-fg-dim mb-6">{event.artist}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            <Stat label="Date" value={event.date.split("·")[0].trim()} />
            <Stat label="Time" value={event.date.split("·")[1]?.trim() ?? ""} />
            <Stat label="Venue" value={event.venue} />
            <Stat label="Doors" value="30 min early" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="font-mono text-xs text-accent tracking-[0.2em] mb-3">[ ABOUT ]</div>
            <p className="text-fg-dim leading-relaxed text-[15px]">
              {event.artist} takes the {event.venue} stage for a night of live performance as part of their current tour. Every ticket is minted as a unique token on the TiX protocol — fully transferable, verifiable, and yours to keep or resell.
            </p>
          </section>

          <section>
            <div className="font-mono text-xs text-accent tracking-[0.2em] mb-3">[ SELECT TIER ]</div>
            <div className="space-y-2">
              {sections.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setSelectedSection(s.name)}
                  className={`w-full text-left p-4 rounded-lg border transition-all flex items-center justify-between ${
                    selectedSection === s.name
                      ? "border-accent bg-accent/5 glow"
                      : "border-border bg-bg-card hover:border-border hover:bg-bg-hover"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        selectedSection === s.name
                          ? "border-accent bg-accent"
                          : "border-border"
                      }`}
                    />
                    <div>
                      <div className="font-mono text-sm font-semibold">{s.name}</div>
                      <div className="text-xs text-fg-dim">{s.note}</div>
                    </div>
                  </div>
                  <div className="font-mono text-lg font-semibold">
                    ${s.price}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="font-mono text-xs text-accent tracking-[0.2em] mb-3">
              [ ON-CHAIN METADATA ]
            </div>
            <div className="bg-bg-card border border-border rounded-lg p-5 font-mono text-xs space-y-2">
              <Meta k="contract" v="0xTICKEX...v1.0" />
              <Meta k="standard" v="ERC-721 (non-fungible)" />
              <Meta k="transferable" v="true" />
              <Meta k="royalty_resale" v="5%" />
              <Meta k="venue_signature" v={`0x${event.id}f2c8a9...3b21`} />
            </div>
          </section>
        </div>

        {/* Right column: buy */}
        <div>
          <div className="sticky top-20 bg-bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-5 border-b border-border">
              <div className="font-mono text-xs text-fg-dim tracking-wider mb-1">
                {selectedSection} · 1 ticket
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-semibold">${selected.price}</div>
                <div className="text-xs text-fg-dim">USD</div>
              </div>
            </div>
            <div className="p-5 space-y-3 text-xs font-mono">
              <Row k="Ticket price" v={`$${selected.price}.00`} />
              <Row k="Protocol fee" v="$0.00" />
              <Row k="Network gas" v="≈$0.02" />
              <div className="border-t border-border-soft pt-3">
                <Row k="Total" v={`$${selected.price}.00`} strong />
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={goCheckout}
                className="w-full bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider py-3 rounded hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
              >
                <span>Continue to checkout</span>
                <span>→</span>
              </button>
              <div className="font-mono text-[10px] text-fg-faint text-center mt-3 tracking-wider">
                DEMO · NO REAL PAYMENT
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Also showing */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="font-mono text-xs text-accent tracking-[0.2em] mb-4">
          [ YOU MIGHT ALSO LIKE ]
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {otherEvents.map((ev) => (
            <a
              key={ev.id}
              href={`/event/${ev.id}`}
              className={`aspect-[4/3] rounded-lg bg-gradient-to-br ${ev.gradient} border border-border hover:border-accent p-5 flex flex-col justify-end transition-all noise relative overflow-hidden`}
            >
              <div className="font-mono text-[10px] text-fg-dim tracking-wider mb-1">
                {ev.date.split("·")[0].toUpperCase()}
              </div>
              <div className="text-lg font-semibold">{ev.title}</div>
              <div className="text-xs text-fg-dim">{ev.venue}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-accent/50 pl-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim">
        {label}
      </div>
      <div className="text-sm font-medium mt-1">{value}</div>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-fg" : "text-fg-dim"}`}>
      <span>{k}</span>
      <span className={strong ? "font-semibold" : ""}>{v}</span>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-fg-dim">{k}</span>
      <span className="text-accent">{v}</span>
    </div>
  );
}
