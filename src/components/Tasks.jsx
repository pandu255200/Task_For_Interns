import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Task.css";
import logo from "../components/logo.webp";
import { Mic } from "lucide-react";
import { Search } from "lucide-react";

// const API_BASE = 'http://localhost:5000/api';
const API_BASE = process.env.REACT_APP_API_BASE;


const Task = () => {

  const [mentors, setMentors] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedIntern, setSelectedIntern] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("pending");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [animationMap, setAnimationMap] = useState({});
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");


  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTaskInput(transcript);
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setListening(false);
    }
  };
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";

  // Fetch mentors on mount
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await axios.get(`${API_BASE}/mentors`);
        setMentors(res.data);
      } catch (err) {
        console.error("Failed to fetch mentors", err);
      }
    };
    fetchMentors();
  }, []);

  // Fetch all members on mount
  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/members`);
        setAllMembers(res.data);
      } catch (err) {
        console.error("Failed to fetch members", err);
      }
    };
    fetchAllMembers();
  }, []);

  // Filter team members when selected mentor or allMembers change
  useEffect(() => {
    if (!selectedMentor) {
      setTeamMembers([]);
      setSelectedIntern("");
      return;
    }

    const filtered = allMembers.filter((member) => {
      const mentorId =
        typeof member.mentor === "object" ? member.mentor._id : member.mentor;
      return mentorId === selectedMentor;
    });

    setTeamMembers(filtered);
    // Reset task form states on mentor change
    setTaskInput("");
    setAssignedTo("");
    setStatus("pending");
    setEditingTaskId(null);
    setSelectedIntern("");
  }, [selectedMentor, allMembers]);

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${API_BASE}/tasks`);
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };
    fetchTasks();
  }, []);

  // When editingTaskId changes, populate the form with task details or reset
  useEffect(() => {
    if (editingTaskId !== null) {
      const taskToEdit = tasks.find((t) => t._id === editingTaskId);
      if (taskToEdit) {
        setTaskInput(taskToEdit.title || taskToEdit.task); // handle naming difference
        setAssignedTo(taskToEdit.assignedTo || taskToEdit.intern);
        setStatus(taskToEdit.status);
        setSelectedIntern(taskToEdit.assignedTo || taskToEdit.intern);
      }
    } else {
      setTaskInput("");
      setAssignedTo("");
      setStatus("pending");
      setSelectedIntern("");
    }
  }, [editingTaskId, tasks]);

  // Add or update task handler
  const handleAddTask = async () => {
    if (!taskInput.trim() || !assignedTo) return;
    const newDate = new Date().toISOString();

    try {
      if (editingTaskId !== null) {
        // Update existing task
        const res = await axios.put(`${API_BASE}/tasks/${editingTaskId}`, {
          title: taskInput.trim(),
          assignedTo,
          status,
          dueDate: newDate,
        });
        setTasks((prev) =>
          prev.map((t) => (t._id === editingTaskId ? res.data : t))
        );
        setAnimationMap((prev) => ({
          ...prev,
          [editingTaskId]: "animate-update",
        }));
        setEditingTaskId(null);
        alert("✅ Task updated!");
      } else {
        // Add new task
        const res = await axios.post(`${API_BASE}/tasks`, {
          title: taskInput.trim(),
          assignedTo,
          status,
          dueDate: newDate,
        });
        setTasks((prev) => [res.data, ...prev]);
        setAnimationMap((prev) => ({ ...prev, [res.data._id]: "animate-add" }));
        alert("🎉 Task added!");
      }

      // Reset form inputs
      setTaskInput("");
      setAssignedTo("");
      setStatus("pending");
    } catch (err) {
      alert("Error saving task");
      console.error(err);
    }
  };

  // Delete task handler with animation
  const handleDelete = (id) => {
    if (editingTaskId === id) setEditingTaskId(null);

    setAnimationMap((prev) => ({ ...prev, [id]: "animate-delete" }));
    setTimeout(async () => {
      try {
        await axios.delete(`${API_BASE}/tasks/${id}`);
        setTasks((tasks) => tasks.filter((task) => task._id !== id));
        setAnimationMap((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        alert("🗑️ Task deleted!");
      } catch (err) {
        alert("Failed to delete task");
        console.error(err);
      }
    }, 400);
  };

  // Start editing a task
  const handleEdit = (id) => setEditingTaskId(id);

  // Cancel editing task
  const handleCancelEdit = () => setEditingTaskId(null);

  // Helper: get intern _id by their name
  const getInternIdByName = (name) => {
    const intern = teamMembers.find((member) => member.name === name);
    return intern ? intern._id : "";
  };

  // Filter tasks based on selected mentor and intern
  

  // Helper: get intern name by _id or name (fallback)
  const getInternNameById = (idOrName) => {
    const intern = allMembers.find(
      (member) => member._id === idOrName || member.name === idOrName
    );
    return intern ? intern.name : idOrName;
  };

  // Format status text with capitalized words
  const formatStatus = (status) => {
    return status
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
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
      alert(`Voice input error: ${event.error}`);
    };

    recognition.onend = () => {
      setListening(false);
    };

    return () => {
      recognition.stop();
    };
  }, []);

  const handleVoiceInput = () => {
    setListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setTaskInput(voiceText); // Set task input from voice
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

   const filteredTasks = tasks.filter((task) => {
    // Filter by mentor if selected
    if (selectedMentor) {
      const teamMemberIds = teamMembers.map((m) => m._id);
      const taskAssignedTo = task.assignedTo || task.intern;
      
      if (!teamMemberIds.includes(taskAssignedTo)) return false;

      // Filter by selected intern if any
      if (selectedIntern) {
        const selectedInternId = getInternIdByName(selectedIntern);
        return taskAssignedTo === selectedInternId;
      }
    }

    // Filter by search term if any
    if (searchTerm) {
      const internName = getInternNameById(task.assignedTo || task.intern);
      const taskTitle = task.title || task.task;
      
      return (
        internName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        taskTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return true;
  });
  

  return (
    <div className="task-container">
      <img src={logo} alt="ResoluteAI" className="logo" />
      <h1 className="app-heading">Interns Task Management Application</h1>

      <div className="top-header">
        <h2>
        <span className="spanto"> Reporting to: </span><span className="report">Mr. Parikshit Bangde</span>
        </h2>
      </div>

      {/* Mentor selection */}
      <div className="section">
         <div className="filter-section">
        {/* Mentor selection */}
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

      {/* Show team members & task form if mentor selected */}
      {selectedMentor && (
        <>
          <div className="section">
            <h3><span className="teams">Team Members under Selected Mentor:</span></h3>
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

          {/* Task form */}
          <div className="section form-section">
            <input
              type="text"
              placeholder="Enter Task"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              style={{ width: "500px" }} // Set any width you want
            />

            <button
              onClick={startListening}
              className={`voice-button ${listening ? "listening" : ""}`}
              disabled={!voiceSupported}
              title={
                voiceSupported ? "Use voice input" : "Voice input not supported"
              }
              style={{ marginLeft: "-8px" }}
            >
              <Mic size={15} />
              {listening && <span className="pulse-ring"></span>}
            </button>

            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="spaced-element"
            >
              <option value="">Assign to</option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="spaced-element"
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {editingTaskId !== null ? (
              <>
                <button
                  onClick={handleAddTask}
                  disabled={!selectedMentor || !assignedTo}
                  className="spaced-element"
                >
                  Update Task
                </button>
                <button onClick={handleCancelEdit} className="spaced-element">
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleAddTask}
                disabled={!selectedMentor || !assignedTo}
                className="spaced-element"
              >
                Add Task
              </button>
            )}
          </div>
        </>
      )}

      {/* Tasks list */}
      <div className="tasks-section">
        <h3><span className="tasksmore">Tasks List</span></h3>
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
                <p>
                  Assigned to:{" "}
                  {getInternNameById(task.assignedTo || task.intern)}
                </p>
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
                  Assigned Date: {new Date(task.dueDate).toLocaleDateString()}
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
