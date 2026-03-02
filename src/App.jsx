import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import BoardPage from "./pages/BoardPage";

function App() {
  const defaultBoardId = "69a5a12e03f30c203fd3c3aa"; // 🔴 Replace with your real board ID

  return (
    <Router>
      <Routes>
        {/* Redirect root to board */}
        <Route path="/" element={<Navigate to={`/boards/${defaultBoardId}`} />} />

        {/* Board route */}
        <Route path="/boards/:boardId" element={<BoardPage />} />
      </Routes>
    </Router>
  );
}

export default App;