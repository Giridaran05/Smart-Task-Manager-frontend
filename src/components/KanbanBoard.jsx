import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import API from "../services/api";
import "./KanbanBoard.css";

export default function KanbanBoard({ boardId }) {
  const [lists, setLists] = useState({});
  const [listOrder, setListOrder] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newList, setNewList] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (boardId) {
      fetchBoard();
      fetchActivity();
    }
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      const res = await API.get(`/lists/${boardId}`);
      const formatted = {};
      const order = [];

      for (let list of res.data) {
        const cardsRes = await API.get(
          `/cards/list/${list._id}`
        );

        formatted[list._id] = {
          ...list,
          cards: cardsRes.data,
        };

        order.push(list._id);
      }

      setLists(formatted);
      setListOrder(order);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await API.get(
        `/activity/${boardId}`
      );
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addList = async () => {
    if (!newList.trim()) return;

    await API.post("/lists", {
      title: newList,
      boardId,
    });

    setNewList("");
    fetchBoard();
  };

  const addCard = async (listId) => {
    await API.post("/cards", {
      title: "New Task",
      listId,
      priority: "medium",
    });

    fetchBoard();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceList =
      lists[result.source.droppableId];

    const card =
      sourceList.cards[result.source.index];

    await API.patch(`/cards/${card._id}`, {
      listId:
        result.destination.droppableId,
    });

    fetchBoard();
  };

  const filteredCards = (cards) =>
    cards.filter((card) =>
      card.title
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-wrapper">

        {/* HEADER */}
        <div className="kanban-header">
          <h2>Smart Task Manager 🚀</h2>

          <div className="header-controls">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="New list"
              value={newList}
              onChange={(e) =>
                setNewList(e.target.value)
              }
            />

            <button onClick={addList}>
              Add List
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="kanban-body">

          {/* LISTS */}
          <div className="board-section">
            {listOrder.map((listId) => {
              const list = lists[listId];

              return (
                <div
                  key={listId}
                  className="list-column"
                >
                  <div className="list-header">
                    <h3>{list.title}</h3>
                    <span>
                      {list.cards.length}
                    </span>
                  </div>

                  <Droppable
                    droppableId={listId}
                  >
                    {(provided) => (
                      <div
                        ref={
                          provided.innerRef
                        }
                        {...provided.droppableProps}
                        className="card-container"
                      >
                        {filteredCards(
                          list.cards
                        ).map(
                          (card, index) => (
                            <Draggable
                              key={
                                card._id
                              }
                              draggableId={
                                card._id
                              }
                              index={index}
                            >
                              {(
                                provided
                              ) => (
                                <div
                                  ref={
                                    provided.innerRef
                                  }
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="card"
                                >
                                  <div className="card-title">
                                    {
                                      card.title
                                    }
                                  </div>

                                  <div className="card-meta">
                                    <span
                                      className={`priority ${card.priority}`}
                                    >
                                      {
                                        card.priority
                                      }
                                    </span>

                                    {card.dueDate && (
                                      <span className="due-date">
                                        📅{" "}
                                        {new Date(
                                          card.dueDate
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>

                                  {card
                                    .comments
                                    ?.length >
                                    0 && (
                                    <div className="comment-count">
                                      💬{" "}
                                      {
                                        card
                                          .comments
                                          .length
                                      }
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          )
                        )}
                        {
                          provided.placeholder
                        }
                      </div>
                    )}
                  </Droppable>

                  <button
                    className="add-card-btn"
                    onClick={() =>
                      addCard(listId)
                    }
                  >
                    + Add Card
                  </button>
                </div>
              );
            })}
          </div>

          {/* ACTIVITY */}
          <div className="activity-panel">
            <h3>Activity</h3>

            {activities.length === 0 && (
              <p>No activity yet</p>
            )}

            {activities.map((a) => (
              <div
                key={a._id}
                className="activity-item"
              >
                <div>{a.action}</div>
                <small>
                  {new Date(
                    a.createdAt
                  ).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}