import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

import "./reports.css";

const Reports = () => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);

  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_BASE}/api/tasks`)
      .then((res) => res.json()) // make sure your API responds with a list of tasks
      .then((data) => setTasks(data))
      .catch((error) => console.error(error));

    fetch(`${API_BASE}/api/members`)
      .then((res) => res.json()) // make sure your API responds with a list of members
      .then((data) => setMembers(data))
      .catch((error) => console.error(error));

  }, []);

 // Inside your useEffect for filtering by selectedMemberId:

useEffect(() => {
  if (selectedMemberId) {
    setFilteredTasks(
      tasks.filter((task) => task.assignedTo?._id === selectedMemberId)
    );
  } else {
    setFilteredTasks([]);
  }
}, [selectedMemberId, tasks]);

// The rest (the pieMemberData, barMemberData, table, etc) will work fine
// with this updated filter.


  // Team task stats
  const completed = tasks.filter((task) => task.status === "completed").length;
  const inProgress = tasks.filter((task) => task.status === "in progress").length;
  const pending = tasks.filter((task) => task.status === "pending").length;

  const pieData = [
    { name: "Completed", value: completed },
    { name: "In Progress", value: inProgress },
    { name: "Pending", value: pending },
  ];

  const barData = [
    { name: "Completed", count: completed },
    { name: "In Progress", count: inProgress },
    { name: "Pending", count: pending },
  ];

  // Individual task stats
  const completedMember = filteredTasks.filter((task) => task.status === "completed").length;
  const inProgressMember = filteredTasks.filter((task) => task.status === "in progress").length;
  const pendingMember = filteredTasks.filter((task) => task.status === "pending").length;

  const pieMemberData = [
    { name: "Completed", value: completedMember },
    { name: "In Progress", value: inProgressMember },
    { name: "Pending", value: pendingMember },
  ];

  const barMemberData = [
    { name: "Completed", count: completedMember },
    { name: "In Progress", count: inProgressMember },
    { name: "Pending", count: pendingMember },
  ];

  const COLORS = ["#4caf50", "#ff9800", "#f44336"];

 return (
  <div className="reports-container">
    <div className="report-sections-wrapper">
      
      {/* Team Report */}
      <div className="team-report">
        <h1>Teams Task Report</h1>
        <div className="charts-wrapper">
          {/* Pie Chart */}
          <div className="charts1">
            <h2>Task Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="charts1">
            <h2>Task Count</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Individual Report */}
      <div className="individual-report">
        <h1>Individual Task Report</h1>
        <select
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          style={{ padding: "8px", marginBottom: "20px" }}
        >
          <option value="">Select Member</option>
          {members
            .filter((member) => member.role === "intern")
            .map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
        </select>

        {selectedMemberId && (
          <div className="charts-wrapper">
            {/* Pie Chart */}
            <div className="charts">
              <h2>Individual Task Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieMemberData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {pieMemberData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="charts">
              <h2>Individual Task Count</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barMemberData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

};

export default Reports;
