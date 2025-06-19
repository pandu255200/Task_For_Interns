import React, { useEffect, useState } from "react";
import "./TasksPage.css";

const InternTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  

    const memberId = localStorage.getItem("userId");
    const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const API_URL = 'http://localhost:5000'

  useEffect(() => {
    if (memberId) {
      fetchMemberTasks();
    }
  }, [memberId]);

  const fetchMemberTasks = async () => {
    setLoading(true);
    setError(null);
    try {
     
      const res = await fetch(`${API_BASE}/api/tasks`);

      if (!res.ok) {
        throw new Error(await res.text()); 
      }

      const data = await res.json();

     
      const memberTasks = data.filter(
        (task) => task.assignedTo?._id === memberId
      );

      setTasks(memberTasks);
    } catch (err) {
      setError(err.toString()); 
    } finally {
      setLoading(false);
    }
  };

  
  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(true);
    setUpdateError(null);
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error(await res.text()); 
      }

     
      setTasks((tasks) =>
        tasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      setUpdateError(err.toString()); 
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p>Error: {error}</p>;
  if (tasks.length === 0) return <p>No tasks found</p>;

  return (
    <div className="intern-tasks-page">
      <h2>Your Tasks</h2>
      {updating && <p>Updating...</p>}
      {updateError && <p>Error while updating: {updateError}</p>}

      <ul className="tasks-list">
        {tasks.map((task) => (
          <li key={task._id} className="task-item">
            <h4>{task.title}</h4>
            <p>{task.description}</p>
          <div className="task-meta-row">
    <span className="statuss">Status: {task.status}</span>
    <span className="dues">Due Date: {new Date(task.dueDate).toLocaleDateString()}</span>

    <select
      className="selection"
      disabled={updating}
      value={task.status}
      onChange={(e) => handleStatusChange(task._id, e.target.value)}
    >
      <option value="Pending">Pending</option>
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>
  </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InternTasksPage;
