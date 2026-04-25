"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import TopNav from "@/components/TopNav";
import { getEvent } from "@/lib/mockData";
import {
  generateTokenId,
  shortAddr,
  store,
  type Ticket,
  type Wallet,
} from "@/lib/store";

type Stage = "payment" | "linking" | "confirm" | "processing" | "done";
type PayMethod = "wallet" | "card" | "bank";

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const search = useSearchParams();
  const id = params.id as string;
  const section = search.get("section") ?? "GA";
  const price = Number(search.get("price") ?? "100");
  const event = getEvent(id);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const [stage, setStage] = useState<Stage>("payment");
  const [payMethod, setPayMethod] = useState<PayMethod>("wallet");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [pin, setPin] = useState("");
  const [mintedTicket, setMintedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const u = store.getUser();
    const w = store.getWallet();
    if (!u) router.replace("/login");
    else if (!w) router.replace("/wallet/create");
    else setWallet(w);
  }, [router]);

  if (!event || !wallet) {
    return (
      <div className="min-h-screen">
        <TopNav />
        <div className="p-6 text-fg-dim">Loading…</div>
      </div>
    );
  }

  const linkAndPay = () => {
    setStage("linking");
    setTimeout(() => setStage("confirm"), 1500);
  };

  const confirmPayment = () => {
    if (pin.length !== 6) return;
    setStage("processing");
    setTimeout(() => {
      const ticket: Ticket = {
        id: `t_${Date.now()}`,
        eventId: event.id,
        eventTitle: event.title,
        artist: event.artist,
        venue: event.venue,
        date: event.date,
        section,
        row: section === "VIP" ? "A" : section === "MEZZ" ? "F" : "—",
        seat: section === "GA" ? "STANDING" : `${Math.floor(Math.random() * 30) + 1}`,
        purchasePrice: price,
        tokenId: generateTokenId(),
        forSale: false,
        resalePrice: null,
      };
      store.addTicket(ticket);
      // deduct from wallet balance
      store.setWallet({ ...wallet, balanceUsd: Math.max(0, wallet.balanceUsd - price) });
      setMintedTicket(ticket);
      setStage("done");
    }, 2200);
  };

  return (
    <div className="min-h-screen">
      <TopNav />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Progress header */}
        <div className="flex items-center justify-between mb-8 font-mono text-xs tracking-wider">
          <div className="text-accent">[ CHECKOUT ]</div>
          <div className="flex items-center gap-2">
            <StageDot active={stage === "payment" || stage === "linking"} done={stage !== "payment" && stage !== "linking"} label="PAYMENT" />
            <div className="w-6 h-px bg-border" />
            <StageDot active={stage === "confirm" || stage === "processing"} done={stage === "done"} label="CONFIRM" />
            <div className="w-6 h-px bg-border" />
            <StageDot active={stage === "done"} done={false} label="MINT" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main panel */}
          <div className="lg:col-span-2 bg-bg-card border border-border rounded-lg overflow-hidden">
            {stage === "payment" && (
              <>
                <SectionHeader title="Choose payment method" kicker="01" />
                <div className="p-6 space-y-3">
                  <PayOption
                    selected={payMethod === "wallet"}
                    onClick={() => setPayMethod("wallet")}
                    title="tick/ex Wallet Balance"
                    subtitle={`Current balance: $${wallet.balanceUsd.toFixed(2)}`}
                    badge="FASTEST"
                    icon="W"
                  />
                  <PayOption
                    selected={payMethod === "card"}
                    onClick={() => setPayMethod("card")}
                    title="Credit or debit card"
                    subtitle="Top up your wallet and purchase"
                    icon="C"
                  />
                  <PayOption
                    selected={payMethod === "bank"}
                    onClick={() => setPayMethod("bank")}
                    title="Bank transfer (ACH)"
                    subtitle="1-3 business days · no fees"
                    icon="B"
                  />
                </div>

                {payMethod === "card" && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <div className="bg-bg/50 border border-border-soft rounded-lg p-5 space-y-3">
                      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent mb-2">
                        Card details
                      </div>
                      <CardField
                        label="Card number"
                        value={cardNumber}
                        onChange={(v) => setCardNumber(formatCard(v))}
                        placeholder="4242 4242 4242 4242"
                      />
                      <CardField
                        label="Name on card"
                        value={cardName}
                        onChange={setCardName}
                        placeholder="As shown on card"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <CardField
                          label="Expiry"
                          value={cardExpiry}
                          onChange={(v) => setCardExpiry(formatExpiry(v))}
                          placeholder="MM / YY"
                        />
                        <CardField
                          label="CVC"
                          value={cardCvc}
                          onChange={(v) => setCardCvc(v.replace(/\D/g, "").slice(0, 4))}
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {payMethod === "bank" && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <div className="bg-bg/50 border border-border-soft rounded-lg p-5 font-mono text-xs text-fg-dim">
                      Bank linking demo — skipped for prototype. Proceed with mock balance.
                    </div>
                  </div>
                )}

                <div className="px-6 pb-6">
                  <button
                    onClick={linkAndPay}
                    className="w-full bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider py-3 rounded hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Link to wallet & continue</span>
                    <span>→</span>
                  </button>
                </div>
              </>
            )}

            {stage === "linking" && (
              <div className="p-12 text-center">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 border border-accent rounded flex items-center justify-center font-mono text-sm text-accent animate-pulse">
                    {payMethod === "wallet" ? "W" : payMethod === "card" ? "C" : "B"}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                  <div className="w-10 h-10 border border-accent rounded flex items-center justify-center font-mono text-xs text-accent">
                    {shortAddr(wallet.address).slice(0, 4)}
                  </div>
                </div>
                <div className="font-mono text-sm text-accent caret">
                  Linking payment method
                </div>
                <div className="font-mono text-[10px] text-fg-dim mt-2 tracking-wider">
                  Establishing secure channel with your wallet
                </div>
              </div>
            )}

            {stage === "confirm" && (
              <>
                <SectionHeader title="Authorize purchase" kicker="02" />
                <div className="p-6">
                  <div className="bg-bg/50 border border-border-soft rounded-lg p-4 mb-6 font-mono text-xs">
                    <div className="flex justify-between mb-2">
                      <span className="text-fg-dim">From</span>
                      <span className="text-accent">{shortAddr(wallet.address)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-fg-dim">To</span>
                      <span className="text-accent">0xTICKEX...primary</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-fg-dim">Amount</span>
                      <span>${price}.00 USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-dim">Mint</span>
                      <span>TICKET #{event.id.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim mb-2">
                      Enter wallet PIN to sign
                    </div>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-bg border border-border rounded px-3 py-3 font-mono text-xl tracking-[0.4em] text-center focus:outline-none focus:border-accent transition-colors"
                      placeholder="••••••"
                      autoFocus
                    />
                    <div className="font-mono text-[10px] text-fg-faint mt-1.5 text-center">
                      DEMO · ANY 6 DIGITS WORKS
                    </div>
                  </div>

                  <button
                    onClick={confirmPayment}
                    disabled={pin.length !== 6}
                    className="w-full bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider py-3 rounded hover:bg-accent/90 disabled:bg-bg-hover disabled:text-fg-faint disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Sign & pay ${price}</span>
                    <span>→</span>
                  </button>
                </div>
              </>
            )}

            {stage === "processing" && (
              <div className="p-12 text-center">
                <div className="inline-block mb-6">
                  <div className="w-16 h-16 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                </div>
                <div className="font-mono text-sm text-accent caret mb-2">
                  Minting ticket to your wallet
                </div>
                <div className="font-mono text-[10px] text-fg-dim space-y-1 tracking-wider">
                  <div>· Signing transaction</div>
                  <div>· Broadcasting to network</div>
                  <div>· Waiting for confirmation</div>
                </div>
              </div>
            )}

            {stage === "done" && mintedTicket && (
              <div className="p-8 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-accent flex items-center justify-center glow-strong">
                    <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="font-mono text-xs text-accent tracking-[0.2em] mb-2">
                    [ TRANSACTION CONFIRMED ]
                  </div>
                  <h3 className="text-2xl font-semibold">Ticket is yours</h3>
                  <p className="text-sm text-fg-dim mt-2">
                    Minted to your wallet. You can view or resell it anytime.
                  </p>
                </div>

                <TicketPreview ticket={mintedTicket} event={event} />

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => router.push("/inventory")}
                    className="flex-1 bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider py-3 rounded hover:bg-accent/90 transition-colors"
                  >
                    View wallet →
                  </button>
                  <button
                    onClick={() => router.push("/home")}
                    className="flex-1 border border-border hover:border-accent font-mono text-sm uppercase tracking-wider py-3 rounded transition-colors"
                  >
                    Keep browsing
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-bg-card border border-border rounded-lg overflow-hidden sticky top-20">
              <div className={`h-20 bg-gradient-to-br ${event.gradient} relative noise`}>
                <div className="absolute bottom-2 left-3 font-mono text-[9px] tracking-[0.2em] bg-bg/70 backdrop-blur-sm border border-border rounded px-2 py-0.5 text-accent">
                  {event.tag}
                </div>
              </div>
              <div className="p-4 border-b border-border">
                <div className="font-semibold text-sm leading-tight mb-1">
                  {event.title}
                </div>
                <div className="text-xs text-fg-dim">{event.artist}</div>
                <div className="text-xs text-fg-dim mt-1">
                  {event.venue} · {event.date.split("·")[0]}
                </div>
              </div>
              <div className="p-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-fg-dim">
                  <span>Tier</span>
                  <span className="text-fg">{section}</span>
                </div>
                <div className="flex justify-between text-fg-dim">
                  <span>Quantity</span>
                  <span className="text-fg">1</span>
                </div>
                <div className="flex justify-between text-fg-dim">
                  <span>Subtotal</span>
                  <span className="text-fg">${price}.00</span>
                </div>
                <div className="flex justify-between text-fg-dim">
                  <span>Fees</span>
                  <span className="text-fg">$0.00</span>
                </div>
                <div className="border-t border-border-soft pt-2 flex justify-between">
                  <span className="text-fg-dim">Total</span>
                  <span className="font-semibold text-fg">${price}.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, kicker }: { title: string; kicker: string }) {
  return (
    <div className="border-b border-border px-6 py-4">
      <div className="font-mono text-xs text-accent tracking-[0.2em] mb-1">
        [ {kicker} ]
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

function PayOption({
  selected,
  onClick,
  title,
  subtitle,
  badge,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  badge?: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all flex items-center gap-4 ${
        selected
          ? "border-accent bg-accent/5 glow"
          : "border-border bg-bg/30 hover:border-border hover:bg-bg-hover"
      }`}
    >
      <div
        className={`w-10 h-10 rounded flex items-center justify-center font-mono text-sm border ${
          selected ? "border-accent text-accent" : "border-border text-fg-dim"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          {badge && (
            <span className="font-mono text-[9px] text-accent border border-accent/40 rounded px-1.5 py-0.5 tracking-wider">
              {badge}
            </span>
          )}
        </div>
        <div className="text-xs text-fg-dim">{subtitle}</div>
      </div>
      <div
        className={`w-4 h-4 rounded-full border-2 ${
          selected ? "border-accent bg-accent" : "border-border"
        }`}
      />
    </button>
  );
}

function CardField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-bg border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent transition-colors"
      />
    </label>
  );
}

function StageDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          done ? "bg-accent" : active ? "bg-accent animate-pulse" : "bg-border"
        }`}
      />
      <span
        className={`${
          done || active ? "text-accent" : "text-fg-faint"
        } tracking-wider`}
      >
        {label}
      </span>
    </div>
  );
}

function TicketPreview({
  ticket,
  event,
}: {
  ticket: Ticket;
  event: { gradient: string };
}) {
  return (
    <div
      className={`relative rounded-lg border border-accent bg-gradient-to-br ${event.gradient} p-5 overflow-hidden noise`}
    >
      {/* perforated separator */}
      <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-border/50" />
      <div className="absolute -left-2 top-1/2 w-4 h-4 bg-bg-card rounded-full -translate-y-1/2" />
      <div className="absolute -right-2 top-1/2 w-4 h-4 bg-bg-card rounded-full -translate-y-1/2" />

      <div className="font-mono text-[10px] text-accent tracking-[0.2em] mb-2">
        [ NFT TICKET ]
      </div>
      <div className="text-lg font-semibold mb-1">{ticket.eventTitle}</div>
      <div className="text-xs text-fg-dim mb-4">
        {ticket.venue} · {ticket.date}
      </div>
      <div className="grid grid-cols-3 gap-3 pt-5 border-t border-dashed border-fg-faint/30 font-mono text-xs">
        <div>
          <div className="text-[9px] text-fg-dim tracking-wider">SECTION</div>
          <div className="text-accent font-semibold">{ticket.section}</div>
        </div>
        <div>
          <div className="text-[9px] text-fg-dim tracking-wider">ROW</div>
          <div>{ticket.row}</div>
        </div>
        <div>
          <div className="text-[9px] text-fg-dim tracking-wider">SEAT</div>
          <div>{ticket.seat}</div>
        </div>
      </div>
      <div className="mt-3 font-mono text-[10px] text-fg-dim flex justify-between">
        <span>TOKEN #{ticket.tokenId}</span>
        <span>ID {ticket.id.slice(0, 10)}</span>
      </div>
    </div>
  );
}

function formatCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}
