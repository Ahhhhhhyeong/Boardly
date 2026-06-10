import { createBrowserRouter, Navigate, Outlet, redirect, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { Board, Card, Column, View } from "../types/boardTypes";
import { User } from "../types/userType";
import { AuthPage } from "../pages/AuthPage";
import { DashboardPage } from "../pages/DashboardPage";
import { BoardPage } from "../pages/BoardPage";
import { BOARD_COLORS } from "../components/board-ui";
import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";

const SK = {
  THEME: "boardly_theme",
};

function uid() {
  return crypto.randomUUID();
}

async function authGuard() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return redirect("/auth");
    }

    const payload = await response.json();
    if (!payload?.user) {
      return redirect("/auth");
    }

    return null;
  } catch {
    return redirect("/auth");
  }
}

async function isAuthenticated() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return false;
    }

    const payload = await response.json();
    return Boolean(payload?.user);
  } catch {
    return false;
  }
}

async function rootRedirect() {
  return redirect((await isAuthenticated()) ? "/dashboard" : "/auth");
}

async function guestOnlyGuard() {
  if (await isAuthenticated()) {
    return redirect("/dashboard");
  }

  return null;
}

interface AppRouteContext {
  user: User | null;
  selectedBoard: Board | null;
  isInitializing: boolean;
  isDark: boolean;
  boards: Board[];
  columns: Column[];
  cards: Card[];
  onLogin: (user: User) => Promise<void>;
  onLogout: () => Promise<void>;
  onSelectBoard: (board: Board) => void;
  onCreateBoard: (board: Board) => Promise<void>;
  onUpdateBoard: (board: Board) => Promise<void>;
  onDeleteBoard: (id: string) => Promise<void>;
  onAddColumn: (column: Column) => Promise<void>;
  onUpdateColumn: (column: Column) => Promise<void>;
  onDeleteColumn: (id: string) => Promise<void>;
  onAddCard: (card: Card) => Promise<void>;
  onUpdateCard: (card: Card) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
  onToggleTheme: () => void;
  uid: () => string;
  boardColors: string[];
}

type CreateBoardResponse = {
  board: Board;
  columns: Column[];
};

function AppRoute() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const navigate = useNavigate();

  async function loadWorkspace(knownUser?: User) {
    try {
      const [me, nextBoards, nextColumns, nextCards] = await Promise.all([
        knownUser ? Promise.resolve({ user: knownUser }) : apiGet<{ user: User }>("/auth/me"),
        apiGet<Board[]>("/boards"),
        apiGet<Column[]>("/columns"),
        apiGet<Card[]>("/cards"),
      ]);

      setUser(me.user);
      setBoards(nextBoards);
      setColumns(nextColumns);
      setCards(nextCards);
    } catch {
      setUser(null);
      setBoards([]);
      setColumns([]);
      setCards([]);
      throw new Error("Unable to load workspace");
    } finally {
      setIsInitializing(false);
    }
  }

  useEffect(() => {
    const theme = localStorage.getItem(SK.THEME);
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }

    loadWorkspace().catch(() => undefined);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(SK.THEME, next ? "dark" : "light");
  }

  async function handleLogin(u: User) {
    await loadWorkspace(u);
    navigate("/dashboard");
  }

  async function handleLogout() {
    await apiPost("/auth/signout", {});
    setUser(null);
    setSelectedBoard(null);
    setBoards([]);
    setColumns([]);
    setCards([]);
    navigate("/auth");
  }

  async function createBoard(b: Board) {
    const created = await apiPost<CreateBoardResponse>("/boards", b);
    setBoards((current) => [...current, created.board]);
    setColumns((current) => [...current, ...created.columns]);
  }

  async function updateBoard(b: Board) {
    const updated = await apiPatch<Board>(`/boards/${b.id}`, b);
    setBoards((current) => current.map((x) => (x.id === updated.id ? updated : x)));
    setSelectedBoard((current) => (current?.id === updated.id ? updated : current));
  }

  async function deleteBoard(id: string) {
    await apiDelete(`/boards/${id}`);
    setBoards((current) => current.filter((x) => x.id !== id));
    setColumns((current) => current.filter((x) => x.boardId !== id));
    setCards((current) => current.filter((x) => x.boardId !== id));
    setSelectedBoard((current) => (current?.id === id ? null : current));
  }

  async function addColumn(col: Column) {
    const created = await apiPost<Column>("/columns", col);
    setColumns((current) => [...current, created]);
  }

  async function updateColumn(col: Column) {
    const updated = await apiPatch<Column>(`/columns/${col.id}`, col);
    setColumns((current) => current.map((x) => (x.id === updated.id ? updated : x)));
  }

  async function deleteColumn(id: string) {
    await apiDelete(`/columns/${id}`);
    setColumns((current) => current.filter((x) => x.id !== id));
    setCards((current) => current.filter((x) => x.columnId !== id));
  }

  async function addCard(card: Card) {
    const created = await apiPost<Card>("/cards", card);
    setCards((current) => [...current, created]);
  }

  async function updateCard(card: Card) {
    const updated = await apiPatch<Card>(`/cards/${card.id}`, card);
    setCards((current) => current.map((x) => (x.id === updated.id ? updated : x)));
  }

  async function deleteCard(id: string) {
    await apiDelete(`/cards/${id}`);
    setCards((current) => current.filter((x) => x.id !== id));
  }

  function selectBoard(b: Board) {
    setSelectedBoard(b);
    navigate("/board");
  }

  const context: AppRouteContext = {
    user,
    selectedBoard,
    isInitializing,
    isDark,
    boards,
    columns,
    cards,
    onLogin: handleLogin,
    onLogout: handleLogout,
    onSelectBoard: selectBoard,
    onCreateBoard: createBoard,
    onUpdateBoard: updateBoard,
    onDeleteBoard: deleteBoard,
    onAddColumn: addColumn,
    onUpdateColumn: updateColumn,
    onDeleteColumn: deleteColumn,
    onAddCard: addCard,
    onUpdateCard: updateCard,
    onDeleteCard: deleteCard,
    onToggleTheme: toggleTheme,
    uid,
    boardColors: BOARD_COLORS,
  };

  return <Outlet context={context} />;
}

function useAppRouteContext() {
  return useOutletContext<AppRouteContext>();
}

function AuthPageRoute() {
  const { onLogin } = useAppRouteContext();
  return <AuthPage onLogin={onLogin} />;
}

function AuthCallbackRoute() {
  const { onLogin } = useAppRouteContext();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    async function completeEmailConfirmation() {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const queryParams = new URLSearchParams(window.location.search);
      const accessToken = hashParams.get("access_token") || queryParams.get("access_token");
      const expiresIn = Number(hashParams.get("expires_in") || queryParams.get("expires_in") || 3600);
      const code = queryParams.get("code");

      if (!accessToken && !code) {
        setError("Email confirmation token was not found.");
        return;
      }

      try {
        const session = await apiPost<{ user: User }>("/auth/session", {
          accessToken,
          expiresIn,
          code,
        });
        window.history.replaceState(null, "", "/auth/callback");
        await onLogin(session.user);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      }
    }

    completeEmailConfirmation();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">Email confirmation failed</h2>
          <p className="text-muted-foreground text-sm mb-6">{error}</p>
          <button className="text-sm font-medium text-primary" onClick={() => navigate("/auth", { replace: true })}>
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <p className="text-sm text-muted-foreground">Completing email confirmation...</p>
    </div>
  );
}

function DashboardPageRoute() {
  const {
    user,
    isInitializing,
    boards,
    cards,
    onSelectBoard,
    onCreateBoard,
    onUpdateBoard,
    onDeleteBoard,
    isDark,
    onToggleTheme,
    onLogout,
    uid,
    boardColors,
  } = useAppRouteContext();

  if (isInitializing) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const userBoards = boards.filter((b) => b.userId === user.id);
  return (
    <DashboardPage
      user={user}
      boards={userBoards}
      cards={cards}
      onSelectBoard={onSelectBoard}
      onCreateBoard={onCreateBoard}
      onUpdateBoard={onUpdateBoard}
      onDeleteBoard={onDeleteBoard}
      isDark={isDark}
      onToggleTheme={onToggleTheme}
      onLogout={onLogout}
      uid={uid}
      boardColors={boardColors}
    />
  );
}

function BoardPageRoute() {
  const {
    user,
    isInitializing,
    selectedBoard,
    columns,
    cards,
    onAddColumn,
    onUpdateColumn,
    onDeleteColumn,
    onAddCard,
    onUpdateCard,
    onDeleteCard,
    onToggleTheme,
    onLogout,
    uid,
    isDark,
  } = useAppRouteContext();
  const navigate = useNavigate();

  if (isInitializing) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!selectedBoard) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <BoardPage
      board={selectedBoard}
      columns={columns}
      cards={cards}
      onBack={() => navigate("/dashboard")}
      onAddColumn={onAddColumn}
      onUpdateColumn={onUpdateColumn}
      onDeleteColumn={onDeleteColumn}
      onAddCard={onAddCard}
      onUpdateCard={onUpdateCard}
      onDeleteCard={onDeleteCard}
      isDark={isDark}
      onToggleTheme={onToggleTheme}
      onLogout={onLogout}
      uid={uid}
    />
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppRoute />,
    children: [
      { index: true, loader: rootRedirect },
      { path: "auth", element: <AuthPageRoute />, loader: guestOnlyGuard },
      { path: "auth/callback", element: <AuthCallbackRoute /> },
      { path: "dashboard", element: <DashboardPageRoute />, loader: authGuard },
      { path: "board", element: <BoardPageRoute />, loader: authGuard },
    ],
  },
]);
