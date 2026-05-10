import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, MessageCircle, PlusCircle, Store, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SearchBar } from "@/components/SearchBar";

export function Navbar() {
  const { user, logout } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const NavLink = ({ to, icon: Icon, label }: { to: string; icon: typeof Heart; label: string }) => (
    <Link to={to} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md transition text-xs ${
      path === to ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`}>
      <Icon className="h-5 w-5" />
      <span className="hidden md:inline">{label}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-foreground shrink-0">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">Markety</span>
        </Link>

        <SearchBar />

        <nav className="flex items-center gap-1">
          <NavLink to="/create" icon={PlusCircle} label="Vender" />
          {user ? (
            <>
              <NavLink to="/favorites" icon={Heart} label="Favoritos" />
              <NavLink to="/chat" icon={MessageCircle} label="Chat" />
              <NavLink to="/profile" icon={UserIcon} label="Perfil" />
              <button onClick={logout} title="Cerrar sesión"
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary text-xs">
                <LogOut className="h-5 w-5" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="ml-2 h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center hover:opacity-90 transition">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
