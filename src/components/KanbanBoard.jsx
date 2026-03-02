import React, { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import API from "../services/api";

export default function KanbanBoard({ boardId }) {
  const [lists, setLists] = useState({});
  const [listOrder, setListOrder] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newCardTitle, setNewCardTitle] = useState({});
  const [newCardPriority, setNewCardPriority] = useState({});
  const [newCardDueDate, setNewCardDueDate] = useState({});
  const [showAddCard, setShowAddCard] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    if (!boardId) return;
    fetchData();
  }, [boardId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/lists/${boardId}`);
      const listsData = res.data;

      const formatted = {};
      const order = [];

      for (let list of listsData) {
        const cardsRes = await API.get(`/cards/list/${list._id}`);
        formatted[list._id] = { ...list, cards: cardsRes.data };
        order.push(list._id);
      }

      setLists(formatted);
      setListOrder(order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (listId) => {
    if (!newCardTitle[listId]?.trim()) return;

    const res = await API.post("/cards", {
      title: newCardTitle[listId],
      listId,
      priority: newCardPriority[listId] || "medium",
      dueDate: newCardDueDate[listId] || null,
    });

    const newCard = res.data;

    setLists({
      ...lists,
      [listId]: {
        ...lists[listId],
        cards: [...lists[listId].cards, newCard],
      },
    });

    setNewCardTitle({ ...newCardTitle, [listId]: "" });
    setNewCardPriority({ ...newCardPriority, [listId]: "medium" });
    setNewCardDueDate({ ...newCardDueDate, [listId]: "" });
    setShowAddCard({ ...showAddCard, [listId]: false });
  };

  const deleteCard = async (cardId, listId) => {
    await API.delete(`/cards/${cardId}`);

    setLists({
      ...lists,
      [listId]: {
        ...lists[listId],
        cards: lists[listId].cards.filter(
          (card) => card._id !== cardId
        ),
      },
    });
  };

  const saveEdit = async () => {
    await API.patch(`/cards/${editingCard._id}`, editingCard);
    setEditingCard(null);
    fetchData();
  };

  const filteredCards = (cards) =>
    cards.filter((card) => {
      const matchesSearch = card.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesPriority =
        filterPriority === "all" ||
        card.priority === filterPriority;

      return matchesSearch && matchesPriority;
    });

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <DragDropContext onDragEnd={() => {}}>
      <div
        style={{
          minHeight: "100vh",
          padding: "20px",
          background: "linear-gradient(135deg,#0f172a,#1e293b)",
          color: "white",
        }}
      >
        {/* SEARCH + FILTER */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "none" }}
          />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "none" }}
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {listOrder.map((listId) => {
            const list = lists[listId];
            if (!list) return null;

            return (
              <div
                key={list._id}
                style={{
                  background: "#1e293b",
                  padding: 15,
                  width: 280,
                  borderRadius: 12,
                }}
              >
                <h3>{list.title}</h3>

                {filteredCards(list.cards).map((card) => (
                  <div
                    key={card._id}
                    style={{
                      background: "#334155",
                      padding: 12,
                      marginBottom: 10,
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ fontWeight: "600" }}>
                      {card.title}
                    </div>

                    <div style={{ fontSize: 12, marginTop: 5 }}>
                      {card.priority} |{" "}
                      {card.dueDate
                        ? new Date(card.dueDate).toLocaleDateString()
                        : "No date"}
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <button
                        onClick={() => setEditingCard(card)}
                        style={{
                          marginRight: 6,
                          background: "#3b82f6",
                          border: "none",
                          color: "white",
                          padding: "4px 6px",
                          borderRadius: 6,
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteCard(card._id, list._id)
                        }
                        style={{
                          background: "#ef4444",
                          border: "none",
                          color: "white",
                          padding: "4px 6px",
                          borderRadius: 6,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {/* ADD CARD */}
                {showAddCard[list._id] ? (
                  <div>
                    <input
                      placeholder="Card title"
                      value={newCardTitle[list._id] || ""}
                      onChange={(e) =>
                        setNewCardTitle({
                          ...newCardTitle,
                          [list._id]: e.target.value,
                        })
                      }
                    />
                    <select
                      value={
                        newCardPriority[list._id] || "medium"
                      }
                      onChange={(e) =>
                        setNewCardPriority({
                          ...newCardPriority,
                          [list._id]: e.target.value,
                        })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <input
                      type="date"
                      value={newCardDueDate[list._id] || ""}
                      onChange={(e) =>
                        setNewCardDueDate({
                          ...newCardDueDate,
                          [list._id]: e.target.value,
                        })
                      }
                    />
                    <button
                      onClick={() => createCard(list._id)}
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      setShowAddCard({
                        ...showAddCard,
                        [list._id]: true,
                      })
                    }
                  >
                    + Add Card
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* EDIT MODAL */}
        {editingCard && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: "#1e293b",
                padding: 20,
                borderRadius: 12,
                width: 400,
              }}
            >
              <h3>Edit Card</h3>

              <input
                value={editingCard.title}
                onChange={(e) =>
                  setEditingCard({
                    ...editingCard,
                    title: e.target.value,
                  })
                }
              />

              <select
                value={editingCard.priority}
                onChange={(e) =>
                  setEditingCard({
                    ...editingCard,
                    priority: e.target.value,
                  })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <input
                type="date"
                value={
                  editingCard.dueDate
                    ? editingCard.dueDate.split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setEditingCard({
                    ...editingCard,
                    dueDate: e.target.value,
                  })
                }
              />

              <div style={{ marginTop: 10 }}>
                <button onClick={saveEdit}>Save</button>
                <button
                  onClick={() => setEditingCard(null)}
                  style={{ marginLeft: 10 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}