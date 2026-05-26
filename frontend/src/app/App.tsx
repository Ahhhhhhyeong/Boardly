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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>("auth");
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);

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
        setView("dashboard");
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
    setView("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem(SK.SESSION);
    setUser(null);
    setSelectedBoard(null);
    setView("auth");
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
    setView("board");
  }

  if (view === "auth") {
    return (
      <AuthPage
        onLogin={handleLogin}
        load={load}
        save={save}
        uid={uid}
        SK={SK}
      />
    );
  }

  if (view === "dashboard" && user) {
    const userBoards = boards.filter((b) => b.userId === user.id);
    return (
      <DashboardPage
        user={user}
        boards={userBoards}
        cards={cards}
        onSelectBoard={selectBoard}
        onCreateBoard={createBoard}
        onUpdateBoard={updateBoard}
        onDeleteBoard={deleteBoard}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        uid={uid}
        boardColors={BOARD_COLORS}
      />
    );
  }

  if (view === "board" && selectedBoard && user) {
    return (
      <BoardPage
        board={selectedBoard}
        columns={columns}
        cards={cards}
        onBack={() => setView("dashboard")}
        onAddColumn={addColumn}
        onUpdateColumn={updateColumn}
        onDeleteColumn={deleteColumn}
        onAddCard={addCard}
        onUpdateCard={updateCard}
        onDeleteCard={deleteCard}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        uid={uid}
      />
    );
  }

  return null;
}
