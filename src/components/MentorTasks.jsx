import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/MentorTasks.css";
import useMentorTasks from "./hooks/useMentorTasks"; // adjust path
import { FaMicrophone } from 'react-icons/fa';


const MentorTasks = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [newAssignedTo, setNewAssignedTo] = useState("");
  const [newStatus, setNewStatus] = useState("pending");
  const [newAssignedDate, setNewAssignedDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("pending");
  const [editDueDate, setEditDueDate] = useState("");
  const [editDueDate1, setEditDueDate1] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  const API_URL = process.env.REACT_APP_API_BASE_URL;
  const {
    teamMembers,
    allTasks,
    loadingMembers,
    loadingTasks,
    addTask,
    deleteTask,
    updateTask,
    setAllTasks,
  } = useMentorTasks(API_URL);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
  recognition.lang = 'en-US';
  const handleMicInput = () => {
  if (isListening) {
    recognition.stop();
    setIsListening(false);
    return;
  }

 recognition.start();
setIsListening(true);

// Optional: Clear field when mic starts
if (editingTaskId) {
  setEditTitle("");
} else {
  setNewTaskInput("");
}

  let speechDetected = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    speechDetected = true;

    if (editingTaskId) {
      setEditTitle(transcript); // ✅ Replace instead of append
    } else {
      setNewTaskInput(transcript); // ✅ Replace instead of append
    }
  };

  recognition.onend = () => {
    if (!speechDetected) {
      // No speech detected, keep existing values
      console.log("No speech detected, keeping existing value");
    }
    setIsListening(false);
  };

  recognition.onerror = (event) => {
    console.error("Mic error:", event.error);
    setIsListening(false);
  };
};


  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error("Failed to delete task:", err.message);
      }
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditStatus(task.status);
    setEditDueDate(task.dueDate?.slice(0, 10));
    setEditDueDate1(task.dueDate1?.slice(0, 10));
  };

  const handleUpdateTask = async () => {
    try {
      await updateTask(editingTaskId, {
        title: editTitle,
        status: editStatus,
        dueDate: editDueDate,
        dueDate1: editDueDate1,
      });
      setEditingTaskId(null);
    } catch (err) {
      console.error("Failed to update task:", err.message);
    }
  };

  const handleAddTask = async () => {
    try {
      await addTask({
        title: newTaskInput,
        assignedTo: newAssignedTo,
        status: newStatus,
        dueDate: newAssignedDate,
        dueDate1: newDueDate,
        assignedBy: localStorage.getItem("userId"),
      });
      setShowAddForm(false);
      setNewTaskInput("");
      setNewAssignedTo("");
      setNewStatus("pending");
      setNewAssignedDate("");
      setNewDueDate("");
    } catch (err) {
      console.error("Error adding task:", err.message);
    }
  };

 const tasksToDisplay = allTasks.filter((task) => {
  const matchesMember = selectedMember
    ? task.assignedTo?._id === selectedMember._id
    : true;

  const matchesSearch =
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignedTo?.name.toLowerCase().includes(searchQuery.toLowerCase());

  return matchesMember && matchesSearch;
});

  return (
    <div className="mentor-tasks-container">
      <h2 className="team-title">Intern's Tasks</h2>

      <button
        className="add-task-btn"
        onClick={() => {
          setShowAddForm(!showAddForm);
          setEditingTaskId(null); // Reset edit mode
        }}
      >
        {showAddForm ? "Close" : "Add Task"}
      </button>
     


      {(showAddForm || editingTaskId) && (
        <div className="task-form">
         <div className="title-with-mic">
            <input
              className="title-inpuot"
    type="text"
    placeholder="Task Title"
    value={editingTaskId ? editTitle : newTaskInput}
    onChange={(e) =>
      editingTaskId
        ? setEditTitle(e.target.value)
        : setNewTaskInput(e.target.value)
    }
  />
  <div className="mic-wrapper">
  <button className="mic-buttonha" onClick={handleMicInput}>
    <FaMicrophone className="mic-icon" />
    {isListening && <span className="mic-wave"></span>}
  </button>
</div>

</div>


          {!editingTaskId && (
            <select
              className="title-poit"
              value={newAssignedTo}
              onChange={(e) => setNewAssignedTo(e.target.value)}
            >
              <option value="">Assign to</option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          )}

          <input
            className="title-poit"
            type="date"
            value={editingTaskId ? editDueDate : newAssignedDate}
            onChange={(e) =>
              editingTaskId
                ? setEditDueDate(e.target.value)
                : setNewAssignedDate(e.target.value)
            }
          />
          <input
            className="title-poit"
            type="date"
            value={editingTaskId ? editDueDate1 : newDueDate}
            onChange={(e) =>
              editingTaskId
                ? setEditDueDate1(e.target.value)
                : setNewDueDate(e.target.value)
            }
          />

          <select
            className="title-puoi"
            value={editingTaskId ? editStatus : newStatus}
            onChange={(e) =>
              editingTaskId
                ? setEditStatus(e.target.value)
                : setNewStatus(e.target.value)
            }
          >
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {editingTaskId ? (
            <>
              <button className="create-btn" onClick={handleUpdateTask}>
                Update Task
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditingTaskId(null)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button className="create-btn" onClick={handleAddTask}>
              Create Task
            </button>
          )}
        </div>
      )}

      <div className="search-bar">
          <input
  type="text"
  placeholder="🔍 Search by title or member name"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="search-input"
/>
     </div>

      <div className="horizontal-member-list">
        {teamMembers.map((member) => (
          <div
            key={member._id}
            className={`member-pill ${
              selectedMember?._id === member._id ? "active" : ""
            }`}
            onClick={() => handleMemberClick(member)}
          >
            {member.name}
          </div>
        ))}
      </div>

      <div className="tasks-container">
        <h3 className="tasks-title">
          {selectedMember ? `Tasks of ${selectedMember.name}` : "Task List"}
        </h3>

        {loadingTasks ? (
          <p>Loading tasks...</p>
        ) : tasksToDisplay.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          tasksToDisplay.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-main">
                <h4 className="title-task">{task.title}</h4>
                <p>Assigned To: {task.assignedTo?.name}</p>
                <p>
                  Status:{" "}
                  <span
                    className={`status-label ${task.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {task.status}
                  </span>
                </p>

                <p>
                  Assigned Date: {new Date(task.dueDate).toLocaleDateString()}
                </p>
                <p>Due Date: {new Date(task.dueDate1).toLocaleDateString()}</p>
              </div>
              <div className="btn-task">
                <button
                  className="edit-btn"
                  onClick={() => handleEditTask(task)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MentorTasks;
