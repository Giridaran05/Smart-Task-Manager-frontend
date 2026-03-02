import { useParams } from "react-router-dom";
import KanbanBoard from "../components/KanbanBoard";

export default function BoardPage() {
  const { boardId } = useParams();

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
          marginBottom: "30px",
        }}
      >
        Smart Task Manager 🚀
      </h1>

      <KanbanBoard boardId={boardId} />
    </div>
  );
}
