import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  LayoutDashboard,
  Layers,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { apiPost } from "../lib/api";
import type { User } from "../types/userType";

type Props = {
  onLogin: (user: User) => Promise<void>;
};

export function AuthPage({ onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        if (!form.name.trim()) {
          setError("Name is required.");
          return;
        }
        if (!form.email.includes("@")) {
          setError("Enter a valid email.");
          return;
        }
        if (form.password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }

        try {
          await apiPost('/auth/signup', {
            email: form.email.toLowerCase().trim(),
            password: form.password,
            name: form.name.trim(),
          });
          setSignupSuccess(true);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message);
        }
      } else {
        try {
          const res = await apiPost('/auth/signin', {
            email: form.email.toLowerCase().trim(),
            password: form.password,
          });
          const user = (res as { user?: User })?.user;
          if (user && onLogin) {
            await onLogin(user);
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="size-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Check your email</h2>
          <p className="text-muted-foreground text-sm mb-6">
            We sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{form.email}</span>.
            Click the link to activate your account.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSignupSuccess(false);
              setMode("login");
              setForm({ name: "", email: "", password: "" });
            }}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-white"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="size-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <Layers className="size-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Boardly</h1>
          <p className="text-white/80 text-lg max-w-sm leading-relaxed">
            Your collaborative Kanban workspace. Manage tasks, track progress,
            and meet deadlines — synced across all your devices.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { label: "Boards", icon: LayoutDashboard },
              { label: "Cards", icon: CheckCircle2 },
              { label: "Synced", icon: Circle },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4">
                <Icon className="size-6 mx-auto mb-2 text-white/90" />
                <p className="text-white/80 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <Layers className="size-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Boardly</h1>
          </div>

          <h2 className="text-2xl font-bold mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            {mode === "login"
              ? "Sign in to access your boards"
              : "Get started with Boardly for free"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder={
                    mode === "signup" ? "At least 6 characters" : "Your password"
                  }
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="pr-10"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              className="text-primary font-medium hover:underline"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setForm({ name: "", email: "", password: "" });
              }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
