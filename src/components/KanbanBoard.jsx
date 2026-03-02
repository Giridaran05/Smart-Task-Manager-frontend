import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import API from "../services/api";

export default function KanbanBoard({ boardId }) {
  const [lists, setLists] = useState({});
  const [listOrder, setListOrder] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterOverdue, setFilterOverdue] = useState(false);

  useEffect(() => {
    if (!boardId) return;
    fetchBoard();
    fetchActivity();
  }, [boardId]);

  const fetchBoard = async () => {
    try {
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
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await API.get(`/activity/${boardId}`);
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const movedCard =
      lists[source.droppableId].cards[source.index];

    await API.patch(`/cards/${movedCard._id}`, {
      listId: destination.droppableId,
    });

    fetchBoard();
    fetchActivity();
  };

  const filteredCards = (cards) =>
    cards.filter((card) => {
      const matchesSearch = card.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesPriority =
        filterPriority === "all" ||
        card.priority === filterPriority;

      const isOverdue =
        card.dueDate &&
        new Date(card.dueDate) < new Date();

      const matchesOverdue =
        !filterOverdue || isOverdue;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesOverdue
      );
    });

  if (loading) return <div>Loading...</div>;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 1fr",
          gap: "40px",
          padding: "20px",
          minHeight: "100vh",
          background: "linear-gradient(135deg,#0f172a,#1e293b)",
          color: "white",
        }}
      >
        {/* LEFT SIDE - BOARD */}
        <div>
          {/* FILTERS */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 20,
              alignItems: "center",
            }}
          >
            <input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              style={{
                padding: 8,
                borderRadius: 6,
                border: "none",
              }}
            />

            <select
              value={filterPriority}
              onChange={(e) =>
                setFilterPriority(e.target.value)
              }
              style={{
                padding: 8,
                borderRadius: 6,
                border: "none",
              }}
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <label>
              <input
                type="checkbox"
                checked={filterOverdue}
                onChange={(e) =>
                  setFilterOverdue(e.target.checked)
                }
              />{" "}
              Overdue
            </label>
          </div>

          {/* LISTS */}
          <div
            style={{
              display: "flex",
              gap: 20,
              alignItems: "flex-start",
            }}
          >
            {listOrder.map((listId) => {
              const list = lists[listId];
              return (
                <div
                  key={listId}
                  style={{
                    background: "#1e293b",
                    padding: 15,
                    width: 280,
                    borderRadius: 12,
                  }}
                >
                  <h3>{list.title}</h3>

                  <Droppable droppableId={listId}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {filteredCards(list.cards).map(
                          (card, index) => {
                            const isOverdue =
                              card.dueDate &&
                              new Date(card.dueDate) <
                                new Date();

                            return (
                              <Draggable
                                key={card._id}
                                draggableId={card._id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={
                                      provided.innerRef
                                    }
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      padding: 12,
                                      marginBottom: 10,
                                      background:
                                        "#1f2937",
                                      borderRadius: 10,
                                      boxShadow:
                                        "0 4px 10px rgba(0,0,0,0.3)",
                                      border:
                                        isOverdue
                                          ? "2px solid red"
                                          : "none",
                                      ...provided
                                        .draggableProps
                                        .style,
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontWeight: 600,
                                      }}
                                    >
                                      {card.title}
                                    </div>

                                    <div
                                      style={{
                                        fontSize: 12,
                                        marginTop: 5,
                                      }}
                                    >
                                      <span
                                        style={{
                                          background:
                                            card.priority ===
                                            "high"
                                              ? "#ef4444"
                                              : card.priority ===
                                                "medium"
                                              ? "#f59e0b"
                                              : "#22c55e",
                                          padding:
                                            "2px 6px",
                                          borderRadius: 6,
                                          marginRight: 6,
                                        }}
                                      >
                                        {card.priority}
                                      </span>

                                      {card.dueDate
                                        ? new Date(
                                            card.dueDate
                                          ).toLocaleDateString()
                                        : "No due date"}
                                    </div>

                                    {card.comments
                                      ?.length > 0 && (
                                      <div
                                        style={{
                                          fontSize: 12,
                                          marginTop: 5,
                                          opacity: 0.8,
                                        }}
                                      >
                                        💬{" "}
                                        {
                                          card.comments
                                            .length
                                        }{" "}
                                        comments
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            );
                          }
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE - ACTIVITY PANEL */}
        <div
          style={{
            background: "#0f172a",
            padding: 20,
            borderRadius: 12,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <h3 style={{ marginBottom: 15 }}>
            Activity
          </h3>

          {activities.length === 0 && (
            <div
              style={{
                opacity: 0.6,
                fontSize: 14,
              }}
            >
              No activity yet
            </div>
          )}

          {activities.map((act) => (
            <div
              key={act._id}
              style={{
                marginBottom: 12,
                padding: 10,
                background: "#1e293b",
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 13 }}>
                {act.action}
              </div>
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.6,
                  marginTop: 4,
                }}
              >
                {new Date(
                  act.createdAt
                ).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}