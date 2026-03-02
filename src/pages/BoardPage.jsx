import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import KanbanBoard from "../components/KanbanBoard";

export default function BoardPage() {
  const { boardId } = useParams();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!boardId) return;

    const fetchBoard = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/boards/${boardId}`
        );

        setBoard(res.data);
      } catch (err) {
        console.error("Board fetch error:", err);
        setError("Failed to load board");
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  if (loading) {
    return (
      <div style={{ color: "white", padding: "30px" }}>
        Loading board...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: "red", padding: "30px" }}>
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "30px",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "600",
          marginBottom: "20px",
        }}
      >
        {board?.title || "Smart Task Manager 🚀"}
      </h1>

      {/* IMPORTANT: Pass fetchBoard for refresh */}
      <KanbanBoard
        boardId={boardId}
        board={board}
        setBoard={setBoard}
      />
    </div>
  );
}