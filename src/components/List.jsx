import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function List({ list, fetchBoard }) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const handleAddCard = async () => {
    if (!cardTitle.trim()) return;

    await axios.post(`${API_URL}/api/cards`, {
      title: cardTitle,
      listId: list._id,
      priority,
      dueDate
    });

    setCardTitle("");
    setShowAddCard(false);
    fetchBoard();
  };

  return (
    <div className="bg-gray-800 p-4 rounded w-64">
      <h3 className="text-white font-bold mb-3">{list.title}</h3>

      {list.cards?.map((card) => (
        <div key={card._id} className="bg-gray-700 p-2 rounded mb-2">
          <p>{card.title}</p>
          <span className="text-sm text-yellow-400">
            {card.priority}
          </span>
        </div>
      ))}

      {!showAddCard ? (
        <button
          onClick={() => setShowAddCard(true)}
          className="mt-2 text-blue-400"
        >
          + Add card
        </button>
      ) : (
        <div className="mt-2">
          <input
            className="w-full p-1 text-black rounded"
            placeholder="Card title"
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
          />

          <select
            className="w-full mt-2 p-1 rounded text-black"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input
            type="date"
            className="w-full mt-2 p-1 rounded text-black"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddCard}
              className="bg-green-600 px-2 py-1 rounded"
            >
              Add
            </button>

            <button
              onClick={() => setShowAddCard(false)}
              className="bg-gray-600 px-2 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}