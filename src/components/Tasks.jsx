import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./styles/Task.css";
import { Search } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const Task = () => {
  const [mentors, setMentors] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedIntern, setSelectedIntern] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("pending");
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [animationMap, setAnimationMap] = useState({});
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dueDate1, setDueDate1] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [notificationSupported, setNotificationSupported] = useState(true);

  const recognitionRef = useRef(null);

  const AppNotification = ({ message, type, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }, [onClose]);

    return (
      <div className={`notification ${type}`}>
        <span className="notification-message">{message}</span>
        <button onClick={onClose} className="notification-close">
          ×
        </button>
      </div>
    );
  };

  const showAppNotification = (message, type) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/mentors`);
        setMentors(res.data);
      } catch (err) {
        console.error("Failed to fetch mentors", err);
      }
    };
    fetchMentors();
  }, []);

  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/members?populate=mentor`);
        setAllMembers(res.data);
      } catch (err) {
        console.error("Failed to fetch members", err);
      }
    };
    fetchAllMembers();
  }, []);

  useEffect(() => {
    if (!selectedMentor) {
      setTeamMembers([]);
      setSelectedIntern("");
      return;
    }

    const filtered = allMembers.filter((member) => {
      if (!member || !member.mentor) {
        console.warn("Member with null mentor:", member);
        return false;
      }

      const mentorId =
        typeof member.mentor === "object" ? member.mentor._id : member.mentor;
      return mentorId === selectedMentor;
    });

    setTeamMembers(filtered);
    setTaskInput("");
    setAssignedTo("");
    setStatus("pending");
    setEditingTaskId(null);
    setSelectedIntern("");
  }, [selectedMentor, allMembers]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/tasks`);
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    if (editingTaskId !== null) {
      const taskToEdit = tasks.find((t) => t._id === editingTaskId);
      if (taskToEdit) {
        setTaskInput(taskToEdit.title || taskToEdit.task);
        setAssignedTo(taskToEdit.assignedTo || taskToEdit.intern);
        setStatus(taskToEdit.status);
        setSelectedIntern(getAssignedName(taskToEdit));
        setDueDate1(
          taskToEdit.dueDate1 ? taskToEdit.dueDate1.split("T")[0] : ""
        );
      }
    } else {
      setTaskInput("");
      setAssignedTo("");
      setStatus("pending");
      setSelectedIntern("");
      setDueDate1("");
    }
  }, [editingTaskId, tasks]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTaskInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setListening(false);
    };

    return () => {
      recognition.stop();
    };
  }, []);

  useEffect(() => {
    if ("Notification" in window && window.Notification) {
      window.Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);

  const handleAddTask = async () => {
    if (!taskInput.trim() || !assignedTo) {
      showAppNotification("Please fill all required fields", "error");
      return;
    }

    const newDate = new Date().toISOString();

    try {
      if (editingTaskId !== null) {
        const res = await axios.put(`${API_BASE}/api/tasks/${editingTaskId}`, {
          title: taskInput.trim(),
          assignedTo,
          status,
          dueDate: newDate,
          dueDate1: dueDate1 || newDate,
        });
        setTasks((prev) =>
          prev.map((t) => (t._id === editingTaskId ? res.data : t))
        );
        setAnimationMap((prev) => ({
          ...prev,
          [editingTaskId]: "animate-update",
        }));
        setEditingTaskId(null);
        showAppNotification("✅ Task updated!", "success");
      } else {
        const res = await axios.post(`${API_BASE}/api/tasks`, {
          title: taskInput.trim(),
          assignedTo,
          status,
          dueDate: newDate,
          dueDate1: dueDate1 || newDate,
        });
        setTasks((prev) => [res.data, ...prev]);
        setAnimationMap((prev) => ({ ...prev, [res.data._id]: "animate-add" }));
        showAppNotification("🎉 Task added!", "success");
      }

      setTaskInput("");
      setAssignedTo("");
      setStatus("pending");
    } catch (err) {
      showAppNotification("Error saving task", "error");
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    if (editingTaskId === id) setEditingTaskId(null);

    setAnimationMap((prev) => ({ ...prev, [id]: "animate-delete" }));
    setTimeout(async () => {
      try {
        await axios.delete(`${API_BASE}/api/tasks/${id}`);
        setTasks((tasks) => tasks.filter((task) => task._id !== id));
        setAnimationMap((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        showAppNotification("🗑️ Task deleted!", "success");
      } catch (err) {
        showAppNotification("Failed to delete task", "error");
        console.error(err);
      }
    }, 400);
  };

  const handleEdit = (id) => setEditingTaskId(id);
  const handleCancelEdit = () => setEditingTaskId(null);

  const getInternIdByName = (name) => {
    const intern = teamMembers.find((member) => member.name === name);
    return intern ? intern._id : "";
  };

  const getAssignedName = (task) => {
    if (task.assignedTo && typeof task.assignedTo === "object") {
      return task.assignedTo.name;
    }

    const teamMember = teamMembers.find((m) => m._id === task.assignedTo);
    if (teamMember) return teamMember.name;

    const allMember = allMembers.find((m) => m._id === task.assignedTo);
    return allMember ? allMember.name : "Unassigned";
  };

  const formatStatus = (status) => {
    return status
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleVoiceInput = async () => {
    if (!recognitionRef.current) return;
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("Recognition start error:", err);
      setListening(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const taskAssignedTo =
      task.assignedTo === null || task.assignedTo === undefined
        ? undefined
        : typeof task.assignedTo === "object"
        ? task.assignedTo._id
        : task.assignedTo;

    if (selectedMentor) {
      const teamMemberIds = teamMembers.map((member) => member._id);
      if (!teamMemberIds.includes(taskAssignedTo)) return false;

      if (selectedIntern) {
        const selectedInternId = getInternIdByName(selectedIntern);
        return taskAssignedTo === selectedInternId;
      }
    }

    if (searchTerm) {
      const internName = getAssignedName(task).toLowerCase();
      const taskTitle = (task.title || task.task).toLowerCase();
      const dueDate = task.dueDate1
        ? new Date(task.dueDate1).toLocaleDateString().toLowerCase()
        : "";

      return (
        internName.includes(searchTerm.toLowerCase()) ||
        taskTitle.includes(searchTerm.toLowerCase()) ||
        dueDate.includes(searchTerm.toLowerCase())
      );
    }

    return true;
  });

  return (
    <div className="task-container">
      {/* Notification Setup Button */}
      <div style={{ textAlign: "left", margin: "10px 0" }}>
        {notificationSupported && (
          <button
            onClick={async () => {
              try {
                const permission = await Notification.requestPermission();
                showAppNotification(
                  permission === "granted"
                    ? "Browser notifications enabled!"
                    : "Notifications blocked",
                  permission === "granted" ? "success" : "error"
                );
              } catch (error) {
                showAppNotification("Failed to enable notifications", "error");
              }
            }}
            style={{
              background: "#2196F3",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              display: "inline-block",
            }}
          >
            Enable Browser Notifications
          </button>
        )}
      </div>

      {showNotification && (
        <AppNotification
          message={notificationMessage}
          type={notificationType}
          onClose={() => setShowNotification(false)}
        />
      )}

      <h1 className="app-heading">Interns Task Management Application</h1>

      <div className="top-header">
        <h2>
          <span className="spanto"> Reporting to: </span>
          <span className="report">Mr. Parikshit Bangde</span>
        </h2>
      </div>

      {/* Mentor Select */}
      <div className="section">
        <div className="filter-section">
          <div className="section mentor-select">
            <label htmlFor="mentor-select">Select Mentor:</label>
            <select
              id="mentor-select"
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
            >
              <option value="">-- Select Mentor --</option>
              {mentors.map((mentor) => (
                <option key={mentor._id} value={mentor._id}>
                  {mentor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="section search-box">
        <label htmlFor="task-search">Search Tasks:</label>
        <div className="search-container">
          <input
            id="task-search"
            type="text"
            placeholder="Search by member name or task..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="search-icon" size={18} />
        </div>
      </div>

      {selectedMentor && (
        <>
          {/* Team Members */}
          <div className="section">
            <h3>
              <span className="teams">Team Members under Selected Mentor:</span>
            </h3>
            <ul className="team-list">
              {teamMembers.map((member) => (
                <li
                  key={member._id}
                  onClick={() => setSelectedIntern(member.name)}
                  style={{
                    cursor: "pointer",
                    textDecoration:
                      selectedIntern === member.name ? "underline" : "none",
                    fontWeight:
                      selectedIntern === member.name ? "bold" : "normal",
                  }}
                >
                  {member.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Task Form */}
          <div className="section task-form">
            <h3>{editingTaskId ? "Edit Task" : "Add New Task"}</h3>

            <label htmlFor="task-title">Task Title:</label>
            <input
              id="task-title"
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
            />

            <label htmlFor="intern-select">Assign To:</label>
            <select
              id="intern-select"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">-- Select Intern --</option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>

            <label htmlFor="due-date">Due Date:</label>
            <input
              type="date"
              id="due-date"
              value={dueDate1}
              onChange={(e) => setDueDate1(e.target.value)}
            />

            <label htmlFor="status">Status:</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <div className="form-actions">
              <button onClick={handleAddTask}>
                {editingTaskId ? "Update Task" : "Add Task"}
              </button>
              {editingTaskId && (
                <button onClick={handleCancelEdit} className="cancel-button">
                  Cancel
                </button>
              )}
              <button onClick={handleVoiceInput}>
                {listening ? "🎙 Listening..." : "🎤 Use Voice"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tasks List */}
      <div className="tasks-section">
        <h3>
          <span className="tasksmore">Tasks List</span>
        </h3>
        {filteredTasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`task-item ${animationMap[task._id] || ""}`}
              onAnimationEnd={() =>
                setAnimationMap((prev) => {
                  const updated = { ...prev };
                  delete updated[task._id];
                  return updated;
                })
              }
            >
              <div className="task-details">
                <h4>{task.title || task.task}</h4>
                <p>Assigned to: {getAssignedName(task)}</p>
                <p>
                  Status:{" "}
                  <span
                    className={`status-label status-${task.status
                      .toLowerCase()
                      .replace(/\s/g, "-")}`}
                  >
                    {formatStatus(task.status)}
                  </span>
                </p>
                <p>
                  Assigned Date:{" "}
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
                <p>
                  Due Date:{" "}
                  {task.dueDate1
                    ? new Date(task.dueDate1).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
              <div className="task-actions">
                <button onClick={() => handleEdit(task._id)}>Edit</button>
                <button onClick={() => handleDelete(task._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("isLoggedIn");
          window.location.reload();
        }}
        className="logout-button"
      >
        Logout
      </button>
    </div>
  );
};

export default Task;