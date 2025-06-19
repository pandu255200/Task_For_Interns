import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Task.css";
import logo from "../components/logo.webp";
import { Mic } from "lucide-react";
import { Search } from "lucide-react";

// const API_BASE = "http://localhost:5000/api";
// const API_BASE = process.env.REACT_APP_API_BASE;
const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const API_URL = 'http://localhost:5000'

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
  const [dueDate1, setDueDate1] = useState("");
const [showNotification, setShowNotification] = useState(false);
const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState(""); // 'success' or 'error'
  const [notificationSupported, setNotificationSupported] = useState(true);
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

  // Fetch mentors on mount
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

  // Fetch all members on mount
 // Fetch all members on mount
useEffect(() => {
  const fetchAllMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/members?populate=mentor`);
      setAllMembers(res.data);
      console.log('Fetched members:', res.data); // Debug log
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  };
  fetchAllMembers();
}, []);
  // Filter team members when selected mentor or allMembers change
  // Filter team members when selected mentor or allMembers change
useEffect(() => {
  if (!selectedMentor) {
    setTeamMembers([]);
    setSelectedIntern('');
    return;
  }

  const filtered = allMembers.filter((member) => {
    if (!member || !member.mentor) {
      console.warn('Member with null mentor:', member); // Debug log
      return false;
    }
    
    // Handle both populated mentor object and raw ID
    const mentorId = typeof member.mentor === 'object' 
      ? member.mentor._id 
      : member.mentor;
    
    return mentorId === selectedMentor;
  });

  console.log('Filtered team members:', filtered); // Debug log
  setTeamMembers(filtered);
  
  // Reset task form states
  setTaskInput('');
  setAssignedTo('');
  setStatus('pending');
  setEditingTaskId(null);
  setSelectedIntern('');
}, [selectedMentor, allMembers]);



  // Fetch tasks on mount
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

  // When editingTaskId changes, populate the form with task details or reset
  useEffect(() => {
    if (editingTaskId !== null) {
      const taskToEdit = tasks.find((t) => t._id === editingTaskId);
      if (taskToEdit) {
        setTaskInput(taskToEdit.title || taskToEdit.task); // handle naming difference
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

  // Add or update task handler
  const handleAddTask = async () => {
    if (!taskInput.trim() || !assignedTo) {
      setNotificationMessage("Please fill all required fields");
       showAppNotification("Please fill all required fields", "error");
    setNotificationType("error");
    setShowNotification(true);
    return;
  }
    const newDate = new Date().toISOString();

    try {
      if (editingTaskId !== null) {
        // Update existing task
        const res = await axios.put(`${API_BASE}/api/tasks/${editingTaskId}`, {
          title: taskInput.trim(),
          assignedTo,
          status,
          dueDate: newDate,
          dueDate1: dueDate1 || new Date().toISOString(),
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
         showAppNotification(
      editingTaskId ? "✅ Task updated!" : "🎉 Task added!",
      "success"
    );
      } else {
        // Add new task
        const res = await axios.post(`${API_BASE}/api/tasks`, {
          title: taskInput.trim(),
          assignedTo,
          status,
          dueDate: newDate,
          dueDate1: dueDate1 || new Date().toISOString(),
        });
        setTasks((prev) => [res.data, ...prev]);
        setAnimationMap((prev) => ({ ...prev, [res.data._id]: "animate-add" }));
        alert("🎉 Task added!");
      }
       setNotificationMessage(
      editingTaskId ? "✅ Task updated!" : "🎉 Task added!"
    );
    setNotificationType("success");
      setShowNotification(true);
       showAppNotification(
      editingTaskId ? "✅ Task updated!" : "🎉 Task added!",
      "success"
      );
      if (notificationSupported && window.innerWidth > 768) {
        showSystemNotification(
          editingTaskId ? "Task Updated" : "New Task Added",
          { body: taskInput.trim() }
        );
      }

    // Browser notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(
        editingTaskId ? "Task Updated" : "New Task Added",
        {
          body: taskInput.trim(),
          icon: logo
        }
      );
      
      }
      

      // Reset form inputs
      setTaskInput("");
      setAssignedTo("");
      setStatus("pending");
    } catch (err) {
      setNotificationMessage("Error saving task");
      showAppNotification("Error saving task", "error");
    setNotificationType("error");
    setShowNotification(true);
    console.error(err);
    }
  };
useEffect(() => {
  if ("Notification" in window && window.Notification) {
    window.Notification.requestPermission().then(permission => {
      console.log("Notification permission:", permission);
    });
  }
}, []);
const showSystemNotification = (title, options) => {
  if (!("Notification" in window)) {
    showAppNotification(title, 'info');
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, options);
  } else if (Notification.permission !== "denied") {
    // Don't automatically request on mobile
    if (window.innerWidth > 768) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, options);
        }
      });
    }
  }
  };
  useEffect(() => {
  if (!("Notification" in window)) {
    setNotificationSupported(false);
  }
}, []);
  // Delete task handler with animation
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
  function getInternNameByIdd(id) {
    const member = teamMembers.find((m) => m._id === id);
    return member ? member.name : "Unknown";
  }
  // Replace getInternNameByIdd with this simpler version
  const getAssignedName = (task) => {
    // First check if assignedTo is a populated object
    if (task.assignedTo && typeof task.assignedTo === "object") {
      return task.assignedTo.name;
    }

    // Then check in teamMembers
    const teamMember = teamMembers.find((m) => m._id === task.assignedTo);
    if (teamMember) return teamMember.name;

    // Finally check in allMembers as fallback
    const allMember = allMembers.find((m) => m._id === task.assignedTo);
    return allMember ? allMember.name : "Unassigned";
  };

  // Format status text with capitalized words
  const formatStatus = (status) => {
    return status
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const recognitionRef = useRef(null);

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
      if (event.error === "not-allowed") {
        showPermissionError();
      }
    };

    return () => {
      recognition.stop();
    };
  }, []);

  const showPermissionError = () => {
    if (window.innerWidth <= 768) {
      // Mobile devices
      alert(
        "Please enable microphone permissions in your browser settings to use voice input."
      );
    } else {
      alert("Please allow microphone access to use voice input.");
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleVoiceInput = async () => {
    if (!recognitionRef.current) return;

    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      showPermissionError();
      return;
    }

    setListening(true);
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("Recognition start error:", err);
      setListening(false);
    }
  };
 const filteredTasks = tasks.filter((task) => {
    // Get the assigned ID (handling both object and string cases)
   const taskAssignedTo = 
  task.assignedTo === null || task.assignedTo === undefined
    ? undefined
    : typeof task.assignedTo === 'object'
      ? task.assignedTo._id
      : task.assignedTo;
    // Filter by mentor if selected
    if (selectedMentor) {
      const teamMemberIds = teamMembers.map(member => member._id);
      
      // Check if task is assigned to any team member
      if (!teamMemberIds.includes(taskAssignedTo)) return false;

      // Filter by selected intern if any
      if (selectedIntern) {
        const selectedInternId = getInternIdByName(selectedIntern);
        return taskAssignedTo === selectedInternId;
      }
    }

    // Filter by search term if any
    if (searchTerm) {
      const internName = getAssignedName(task).toLowerCase();
      const taskTitle = (task.title || task.task).toLowerCase();
      const dueDate = task.dueDate1 
        ? new Date(task.dueDate1).toLocaleDateString().toLowerCase() 
        : '';
      
      return (
        internName.includes(searchTerm.toLowerCase()) ||
        taskTitle.includes(searchTerm.toLowerCase()) ||
        dueDate.includes(searchTerm.toLowerCase())
      );
    }

    return true;
  })

  return (
    
    <div className="task-container">
       <div style={{ textAlign: 'center', margin: '15px 0' }}>
  {notificationSupported && (
    <button 
      onClick={async () => {
        try {
          const permission = await Notification.requestPermission();
          showAppNotification(
            permission === 'granted' 
              ? 'Browser notifications enabled!' 
              : 'Notifications blocked',
            permission === 'granted' ? 'success' : 'error'
          );
        } catch (error) {
          showAppNotification('Failed to enable notifications', 'error');
        }
      }}
      style={{
        background: '#2196F3',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'inline-block'
      }}
    >
      Enable Browser Notifications
    </button>
  )}
</div>
  
      {showNotification && (
  <AppNotification  // Changed from Notification
    message={notificationMessage}
    type={notificationType}
    onClose={() => setShowNotification(false)}
  />
)}
      {/* <img src={logo} alt="ResoluteAI" className="logo" /> */}
      <h1 className="app-heading">Interns Task Management Application</h1>

      <div className="top-header">
        <h2>
          <span className="spanto"> Reporting to: </span>
          <span className="report">Mr. Parikshit Bangde</span>
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
            <input
              type="date"
              value={dueDate1}
              onChange={(e) => setDueDate1(e.target.value)}
              className="spaced-element"
              min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates
            />

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
                  Assigned Date: {new Date(task.dueDate).toLocaleDateString()}
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
