import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { ChatAPI, UsersAPI, ProductsAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import type { Conversation, Message, User, Product } from "@/data/mock";
import { formatPrice } from "@/utils/format";

export function ChatBox({ conversation }: { conversation: Conversation }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [other, setOther] = useState<User | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { (async () => {
    const otherId = conversation.buyerId === user?.id ? conversation.sellerId : conversation.buyerId;
    setOther(await UsersAPI.get(otherId));
    setProduct(await ProductsAPI.get(conversation.productId));
    setMessages(await ChatAPI.messages(conversation.id));
  })(); }, [conversation, user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    const msg = await ChatAPI.send(conversation.id, user.id, input.trim());
    setMessages((m) => [...m, msg]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      <header className="px-4 py-3 border-b border-border flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
          {other?.firstName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{other?.firstName} {other?.lastName}</p>
          <p className="text-xs text-muted-foreground truncate">{product?.title} · {product && formatPrice(product.price)}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-secondary/30">
        {messages.map((m) => {
          const mine = m.senderId === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card text-foreground rounded-bl-sm border border-border"
              }`}>{m.content}</div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="p-3 border-t border-border flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe un mensaje..."
          className="flex-1 h-10 px-4 rounded-full bg-secondary border border-transparent focus:bg-card focus:border-input focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
        <button type="submit" className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition disabled:opacity-50"
          disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
