"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import { getEvent } from "@/lib/mockData";
import { shortAddr, store, type Ticket, type Wallet } from "@/lib/store";

export default function InventoryPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<"all" | "mine" | "listed">("all");
  const [resellTarget, setResellTarget] = useState<Ticket | null>(null);
  const [resellPrice, setResellPrice] = useState("");

  useEffect(() => {
    const u = store.getUser();
    const w = store.getWallet();
    if (!u) router.replace("/login");
    else if (!w) router.replace("/wallet/create");
    else {
      setWallet(w);
      setTickets(store.getTickets());
    }
  }, [router]);

  const refresh = () => {
    setTickets(store.getTickets());
    setWallet(store.getWallet());
  };

  const listForResale = () => {
    if (!resellTarget) return;
    const priceNum = Number(resellPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;
    store.updateTicket(resellTarget.id, {
      forSale: true,
      resalePrice: priceNum,
    });
    setResellTarget(null);
    setResellPrice("");
    refresh();
  };

  const unlist = (ticket: Ticket) => {
    store.updateTicket(ticket.id, { forSale: false, resalePrice: null });
    refresh();
  };

  const filtered = tickets.filter((t) => {
    if (filter === "listed") return t.forSale;
    return true;
  });

  if (!wallet) return null;

  return (
    <div className="min-h-screen">
      <TopNav />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Wallet header */}
        <div className="bg-bg-card border border-border rounded-lg p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-accent/5 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="font-mono text-xs text-accent tracking-[0.2em] mb-3">
                [ WALLET ]
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded border border-accent flex items-center justify-center font-mono text-accent">
                  ◆
                </div>
                <div className="font-mono text-lg text-fg">
                  {shortAddr(wallet.address)}
                </div>
                <button
                  onClick={() => navigator.clipboard?.writeText(wallet.address)}
                  className="font-mono text-[10px] text-fg-dim hover:text-accent border border-border hover:border-accent rounded px-2 py-1 tracking-wider transition-colors"
                >
                  COPY
                </button>
              </div>
              <div className="text-xs text-fg-dim">Self-custody · TiX network</div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <Metric label="Balance" value={`$${wallet.balanceUsd.toFixed(2)}`} />
              <Metric label="Tickets" value={tickets.length.toString()} />
              <Metric label="Listed" value={tickets.filter((t) => t.forSale).length.toString()} />
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1 bg-bg-card border border-border rounded-md p-1">
            {(["all", "listed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded transition-colors ${
                  filter === f
                    ? "bg-accent/10 text-accent"
                    : "text-fg-dim hover:text-fg"
                }`}
              >
                {f === "all" ? "All tickets" : "Listed for resale"}
              </button>
            ))}
          </div>
          <button
            onClick={() => router.push("/home")}
            className="font-mono text-xs text-fg-dim hover:text-accent transition-colors"
          >
            + Browse events
          </button>
        </div>

        {/* Tickets */}
        {filtered.length === 0 ? (
          <div className="bg-bg-card border border-border border-dashed rounded-lg p-12 text-center">
            <div className="font-mono text-xs text-fg-dim tracking-[0.2em] mb-2">
              [ EMPTY ]
            </div>
            <h3 className="text-lg font-semibold mb-1">No tickets yet</h3>
            <p className="text-sm text-fg-dim mb-5">
              Your wallet inventory is empty. Browse events to get started.
            </p>
            <button
              onClick={() => router.push("/home")}
              className="bg-accent text-bg font-mono text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded hover:bg-accent/90 transition-colors"
            >
              Discover events →
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onList={() => {
                  setResellTarget(ticket);
                  setResellPrice(ticket.purchasePrice.toString());
                }}
                onUnlist={() => unlist(ticket)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resale modal */}
      {resellTarget && (
        <ResaleModal
          ticket={resellTarget}
          price={resellPrice}
          setPrice={setResellPrice}
          onClose={() => setResellTarget(null)}
          onConfirm={listForResale}
        />
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim">
        {label}
      </div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function TicketCard({
  ticket,
  onList,
  onUnlist,
}: {
  ticket: Ticket;
  onList: () => void;
  onUnlist: () => void;
}) {
  const event = getEvent(ticket.eventId);
  const gradient = event?.gradient ?? "from-slate-800 to-slate-900";

  return (
    <div className="bg-bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-all group">
      <div
        className={`relative h-28 bg-gradient-to-br ${gradient} noise p-4 flex flex-col justify-between`}
      >
        <div className="flex items-start justify-between">
          <div className="font-mono text-[10px] tracking-[0.2em] bg-bg/60 backdrop-blur-sm border border-border rounded px-2 py-0.5 text-accent">
            NFT · #{ticket.tokenId}
          </div>
          {ticket.forSale && (
            <div className="font-mono text-[10px] tracking-wider bg-accent text-bg rounded px-2 py-0.5 font-semibold">
              LISTED
            </div>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">
            {ticket.eventTitle}
          </div>
          <div className="text-xs text-fg-dim">{ticket.artist}</div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 font-mono text-xs">
          <Cell k="SECTION" v={ticket.section} accent />
          <Cell k="ROW" v={ticket.row} />
          <Cell k="SEAT" v={ticket.seat} />
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-3 border-t border-border-soft">
          <div>
            <div className="text-[9px] text-fg-dim tracking-wider">VENUE</div>
            <div className="text-xs mt-0.5 truncate">{ticket.venue}</div>
          </div>
          <div>
            <div className="text-[9px] text-fg-dim tracking-wider">DATE</div>
            <div className="text-xs mt-0.5">
              {ticket.date.split("·")[0].trim()}
            </div>
          </div>
        </div>
        <div className="pt-3 border-t border-border-soft flex items-center justify-between font-mono text-xs">
          <span className="text-fg-dim">
            Paid <span className="text-fg">${ticket.purchasePrice}</span>
          </span>
          {ticket.forSale && ticket.resalePrice && (
            <span className="text-accent">
              Listed @ ${ticket.resalePrice}
            </span>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          {ticket.forSale ? (
            <>
              <button className="flex-1 border border-border hover:border-accent font-mono text-xs uppercase tracking-wider py-2 rounded transition-colors">
                View ticket
              </button>
              <button
                onClick={onUnlist}
                className="flex-1 border border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-500/10 font-mono text-xs uppercase tracking-wider py-2 rounded transition-colors"
              >
                Unlist
              </button>
            </>
          ) : (
            <>
              <button className="flex-1 border border-border hover:border-accent font-mono text-xs uppercase tracking-wider py-2 rounded transition-colors">
                View ticket
              </button>
              <button
                onClick={onList}
                className="flex-1 bg-accent/10 border border-accent text-accent hover:bg-accent hover:text-bg font-mono text-xs uppercase tracking-wider py-2 rounded transition-all"
              >
                List for resale →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Cell({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="bg-bg/60 rounded px-2 py-1.5">
      <div className="text-[9px] text-fg-dim tracking-wider">{k}</div>
      <div className={`text-xs font-semibold mt-0.5 ${accent ? "text-accent" : ""}`}>
        {v}
      </div>
    </div>
  );
}

function ResaleModal({
  ticket,
  price,
  setPrice,
  onClose,
  onConfirm,
}: {
  ticket: Ticket;
  price: string;
  setPrice: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const priceNum = Number(price);
  const fee = priceNum * 0.05;
  const youGet = priceNum - fee;

  return (
    <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-bg-card border border-border rounded-lg w-full max-w-md overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] text-accent tracking-[0.2em]">
              [ LIST FOR RESALE ]
            </div>
            <h3 className="text-lg font-semibold mt-1">Set your price</h3>
          </div>
          <button
            onClick={onClose}
            className="text-fg-dim hover:text-fg text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-bg/50 border border-border-soft rounded p-3 font-mono text-xs">
            <div className="text-fg-dim mb-1">Listing</div>
            <div className="font-semibold">{ticket.eventTitle}</div>
            <div className="text-fg-dim mt-1">
              {ticket.section} · Row {ticket.row} · Seat {ticket.seat} · Token #{ticket.tokenId}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim mb-2">
              Resale price (USD)
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-dim font-mono">
                $
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-bg border border-border rounded pl-7 pr-3 py-2.5 font-mono text-lg focus:outline-none focus:border-accent transition-colors"
                placeholder="100"
              />
            </div>
            <div className="font-mono text-[10px] text-fg-dim mt-1.5">
              Paid ${ticket.purchasePrice} · {priceNum && priceNum > ticket.purchasePrice ? (
                <span className="text-accent">+${(priceNum - ticket.purchasePrice).toFixed(2)} markup</span>
              ) : priceNum && priceNum < ticket.purchasePrice ? (
                <span className="text-red-400">-${(ticket.purchasePrice - priceNum).toFixed(2)} loss</span>
              ) : (
                <span>face value</span>
              )}
            </div>
          </div>

          <div className="bg-bg/50 border border-border-soft rounded p-3 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-fg-dim">
              <span>List price</span>
              <span className="text-fg">${priceNum ? priceNum.toFixed(2) : "0.00"}</span>
            </div>
            <div className="flex justify-between text-fg-dim">
              <span>Protocol fee (5%)</span>
              <span className="text-fg">-${fee ? fee.toFixed(2) : "0.00"}</span>
            </div>
            <div className="flex justify-between border-t border-border-soft pt-1.5">
              <span className="text-fg-dim">You receive</span>
              <span className="text-accent font-semibold">
                ${youGet ? youGet.toFixed(2) : "0.00"}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 border border-border hover:border-accent font-mono text-xs uppercase tracking-wider py-2.5 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!priceNum || priceNum <= 0}
              className="flex-1 bg-accent text-bg font-mono text-xs font-semibold uppercase tracking-wider py-2.5 rounded hover:bg-accent/90 disabled:bg-bg-hover disabled:text-fg-faint disabled:cursor-not-allowed transition-colors"
            >
              Confirm listing →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
