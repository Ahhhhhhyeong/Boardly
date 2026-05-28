import { createBrowserRouter, Navigate, Outlet, redirect, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { Board, Card, Column, View } from "../types/boardTypes";
import { User } from "../types/userType";
import { AuthPage } from "../pages/AuthPage";
import { DashboardPage } from "../pages/DashboardPage";
import { BoardPage } from "../pages/BoardPage";
import { BOARD_COLORS } from "../components/board-ui";

const SK = {
  USERS: "boardly_users",
  SESSION: "boardly_session",
  BOARDS: "boardly_boards",
  COLUMNS: "boardly_columns",
  CARDS: "boardly_cards",
  THEME: "boardly_theme",
};

const DEFAULT_COLUMNS = [
  { title: "To Do", color: "#6b7280" },
  { title: "In Progress", color: "#f59e0b" },
  { title: "Review", color: "#8b5cf6" },
  { title: "Done", color: "#10b981" },
];

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

function uid() {
  return crypto.randomUUID();
}

async function authGuard() {
  try {
    const response = await fetch("/login", {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return redirect("/auth");
    }

    const payload = await response.json();
    if (!payload || payload.authenticated !== true) {
      return redirect("/auth");
    }

    return null;
  } catch {
    return redirect("/auth");
  }
}

interface AppRouteContext {
  user: User | null;
  selectedBoard: Board | null;
  isDark: boolean;
  boards: Board[];
  columns: Column[];
  cards: Card[];
  onLogin: (user: User) => void;
  onLogout: () => void;
  onSelectBoard: (board: Board) => void;
  onCreateBoard: (board: Board) => void;
  onUpdateBoard: (board: Board) => void;
  onDeleteBoard: (id: string) => void;
  onAddColumn: (column: Column) => void;
  onUpdateColumn: (column: Column) => void;
  onDeleteColumn: (id: string) => void;
  onAddCard: (card: Card) => void;
  onUpdateCard: (card: Card) => void;
  onDeleteCard: (id: string) => void;
  onToggleTheme: () => void;
  uid: () => string;
  boardColors: string[];
  load: <T,>(key: string, fallback: T) => T;
  save: (key: string, val: unknown) => void;
  SK: typeof SK;
}

function AppRoute() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const theme = localStorage.getItem(SK.THEME);
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }

    const sessionId = localStorage.getItem(SK.SESSION);
    const users = load<User[]>(SK.USERS, []);
    if (sessionId) {
      const u = users.find((x) => x.id === sessionId);
      if (u) {
        setUser(u);
      }
    }

    setBoards(load<Board[]>(SK.BOARDS, []));
    setColumns(load<Column[]>(SK.COLUMNS, []));
    setCards(load<Card[]>(SK.CARDS, []));
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(SK.THEME, next ? "dark" : "light");
  }

  function handleLogin(u: User) {
    setUser(u);
    navigate("/dashboard");
  }

  function handleLogout() {
    localStorage.removeItem(SK.SESSION);
    setUser(null);
    setSelectedBoard(null);
    navigate("/auth");
  }

  function createBoard(b: Board) {
    const defaultCols: Column[] = DEFAULT_COLUMNS.map((dc, i) => ({
      id: uid(),
      boardId: b.id,
      title: dc.title,
      color: dc.color,
      order: i,
    }));
    const next = [...boards, b];
    const nextCols = [...columns, ...defaultCols];
    setBoards(next);
    setColumns(nextCols);
    save(SK.BOARDS, next);
    save(SK.COLUMNS, nextCols);
  }

  function updateBoard(b: Board) {
    const next = boards.map((x) => (x.id === b.id ? b : x));
    setBoards(next);
    save(SK.BOARDS, next);
  }

  function deleteBoard(id: string) {
    const nextBoards = boards.filter((x) => x.id !== id);
    const nextCols = columns.filter((x) => x.boardId !== id);
    const nextCards = cards.filter((x) => x.boardId !== id);
    setBoards(nextBoards);
    setColumns(nextCols);
    setCards(nextCards);
    save(SK.BOARDS, nextBoards);
    save(SK.COLUMNS, nextCols);
    save(SK.CARDS, nextCards);
  }

  function addColumn(col: Column) {
    const next = [...columns, col];
    setColumns(next);
    save(SK.COLUMNS, next);
  }

  function updateColumn(col: Column) {
    const next = columns.map((x) => (x.id === col.id ? col : x));
    setColumns(next);
    save(SK.COLUMNS, next);
  }

  function deleteColumn(id: string) {
    const nextCols = columns.filter((x) => x.id !== id);
    const nextCards = cards.filter((x) => x.columnId !== id);
    setColumns(nextCols);
    setCards(nextCards);
    save(SK.COLUMNS, nextCols);
    save(SK.CARDS, nextCards);
  }

  function addCard(card: Card) {
    const next = [...cards, card];
    setCards(next);
    save(SK.CARDS, next);
  }

  function updateCard(card: Card) {
    const next = cards.map((x) => (x.id === card.id ? card : x));
    setCards(next);
    save(SK.CARDS, next);
  }

  function deleteCard(id: string) {
    const next = cards.filter((x) => x.id !== id);
    setCards(next);
    save(SK.CARDS, next);
  }

  function selectBoard(b: Board) {
    setSelectedBoard(b);
    navigate("/board");
  }

  const context: AppRouteContext = {
    user,
    selectedBoard,
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
    load,
    save,
    SK,
  };

  return <Outlet context={context} />;
}

function useAppRouteContext() {
  return useOutletContext<AppRouteContext>();
}

function AuthPageRoute() {
  const { onLogin, load, save, uid, SK } = useAppRouteContext();
  return <AuthPage onLogin={onLogin} load={load} save={save} uid={uid} SK={SK} />;
}

function DashboardPageRoute() {
  const {
    user,
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
      { index: true, element: <Navigate to="/auth" replace /> },
      { path: "auth", element: <AuthPageRoute /> },
      // { path: "dashboard", element: <DashboardPageRoute />, loader: authGuard },
      { path: "dashboard", element: <DashboardPageRoute /> },
      // { path: "board", element: <BoardPageRoute />, loader: authGuard },
      { path: "board", element: <BoardPageRoute />},
    ],
  },
]);