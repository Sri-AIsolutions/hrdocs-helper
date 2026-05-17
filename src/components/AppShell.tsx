import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen, LogOut, Settings as SettingsIcon } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/40">
      <header className="border-b border-blue-100/60 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-semibold tracking-tight">HRDocs AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" label="Dashboard" />
            <NavLink to="/documents" label="My Documents" icon={FolderOpen} />
            <NavLink to="/settings" label="Settings" icon={SettingsIcon} />
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden lg:inline">{user.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate({ to: "/auth" });
              }}
            >
              <LogOut className="w-4 h-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}

function NavLink({
  to,
  label,
  icon: Icon,
}: {
  to: "/" | "/documents" | "/settings";
  label: string;
  icon?: typeof FolderOpen;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-blue-50 inline-flex items-center gap-1.5"
      activeProps={{ className: "px-3 py-1.5 rounded-md text-sm text-primary bg-blue-50 inline-flex items-center gap-1.5" }}
    >
      {Icon && <Icon className="w-4 h-4" />} {label}
    </Link>
  );
}
