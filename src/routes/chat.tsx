import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ChatAPI, UsersAPI, ProductsAPI } from "@/services/api";
import { ChatBox } from "@/components/ChatBox";
import { Loader, EmptyState } from "@/components/Loader";
import { formatPrice } from "@/utils/format";
import type { Conversation, User, Product } from "@/data/mock";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — Markety" }] }),
  component: Chat,
});

interface Row { convo: Conversation; other: User; product: Product; }

function Chat() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    if (!user) return;
    const cs: Conversation[] = await ChatAPI.conversations(user.id);
    const enriched = await Promise.all(cs.map(async (c) => ({
      convo: c,
      other: (await UsersAPI.get(c.buyerId === user.id ? c.sellerId : c.buyerId))!,
      product: (await ProductsAPI.get(c.productId))!,
    })));
    setRows(enriched);
    setActive(cs[0] ?? null);
    setLoading(false);
  })(); }, [user]);

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">Mensajes</h1>
      {loading ? <Loader />
        : rows.length === 0 ? <EmptyState title="Sin conversaciones" description="Contacta a un vendedor para empezar." />
        : <div className="grid md:grid-cols-[320px_1fr] gap-4 h-[70vh]">
            <div className="bg-card border border-border rounded-xl overflow-y-auto">
              {rows.map((r) => (
                <button key={r.convo.id} onClick={() => setActive(r.convo)}
                  className={`w-full flex items-center gap-3 p-3 text-left border-b border-border hover:bg-secondary transition ${
                    active?.id === r.convo.id ? "bg-secondary" : ""
                  }`}>
                  <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
                    {r.other.firstName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{r.other.firstName} {r.other.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.product.title}</p>
                    <p className="text-xs text-primary">{formatPrice(r.product.price)}</p>
                  </div>
                </button>
              ))}
            </div>
            {active && <ChatBox conversation={active} />}
          </div>}
    </div>
  );
}
