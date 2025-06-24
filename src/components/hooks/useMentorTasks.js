import { useEffect, useState } from 'react';
import axios from 'axios';

const useMentorTasks = (API_URL) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mentorId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        const membersRes = await axios.get(`${API_URL}/api/members/mentor/${mentorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeamMembers(membersRes.data);

        const tasksRes = await axios.get(`${API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const teamMemberIds = membersRes.data.map((m) => m._id);
        const filteredTasks = tasksRes.data.filter((t) =>
          teamMemberIds.includes(t.assignedTo?._id)
        );
        setAllTasks(filteredTasks);
      } catch (err) {
        console.error('Error fetching data:', err.message);
      } finally {
        setLoadingMembers(false);
        setLoadingTasks(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const addTask = async (task) => {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/api/tasks`, task, {
      headers: { Authorization: `Bearer ${token}` },
    });

   const newTask = res.data;

// 🔧 Manually attach the full member object
const member = teamMembers.find(m => m._id === newTask.assignedTo);
newTask.assignedTo = member;

setAllTasks(prev => [...prev, newTask]);
  };

  const deleteTask = async (taskId) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAllTasks((prev) => prev.filter((task) => task._id !== taskId));
  };

 const updateTask = async (taskId, updatedFields) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.put(`${API_URL}/api/tasks/${taskId}`, updatedFields, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const updated = res.data;

    // 💡 If assignedTo is still an ID, populate manually from teamMembers
    if (updated.assignedTo && typeof updated.assignedTo === 'string') {
      const fullMember = teamMembers.find(m => m._id === updated.assignedTo);
      updated.assignedTo = fullMember || updated.assignedTo;
    }

    setAllTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, ...updated } : t))
    );
  } catch (err) {
    console.error('Update failed:', err.message);
  }
};


  return {
    teamMembers,
    allTasks,
    loadingMembers,
    loadingTasks,
    addTask,
    deleteTask,
    updateTask,
    setAllTasks,
  };
};

export default useMentorTasks;
