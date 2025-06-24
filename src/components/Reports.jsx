import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import "./styles/reports.css";

const Reports = () => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/tasks`).then((res) => res.json()),
      fetch(`${API_BASE}/api/members`).then((res) => res.json()),
    ])
      .then(([tasksData, membersData]) => {
        setTasks(tasksData);
        setMembers(membersData);
        setLoading(false);
      })
      .catch((error) => console.error("API Fetch Error:", error));
  }, []);

  useEffect(() => {
    if (selectedMemberId && tasks.length > 0) {
      const filtered = tasks.filter(
        (task) => task.assignedTo?._id === selectedMemberId
      );
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks([]);
    }
  }, [selectedMemberId, tasks]);

  // Team Stats
  const completed = tasks.filter(
    (t) => t.status?.toLowerCase() === "completed"
  ).length;
  const inProgress = tasks.filter(
    (t) => t.status?.toLowerCase() === "in progress"
  ).length;
  const pending = tasks.filter(
    (t) => t.status?.toLowerCase() === "pending"
  ).length;

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

  // Individual Stats
  const completedMember = filteredTasks.filter(
    (t) => t.status?.toLowerCase() === "completed"
  ).length;
  const inProgressMember = filteredTasks.filter(
    (t) => t.status?.toLowerCase() === "in progress"
  ).length;
  const pendingMember = filteredTasks.filter(
    (t) => t.status?.toLowerCase() === "pending"
  ).length;

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
            {/* Team Pie Chart */}
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

            {/* Team Bar Chart */}
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
            disabled={loading}
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            style={{ padding: "8px", marginBottom: "20px" }}
          >
            <option value="">Select Member</option>
            {members
              .filter((m) => m.role === "intern")
              .map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
          </select>

          {selectedMemberId && (
            <div className="charts-wrapper">
              {/* Individual Pie */}
              <div className="charts1">
                <h2>Individual Task Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart key={selectedMemberId}>
                    <Pie
                      data={pieMemberData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      label
                    >
                      {pieMemberData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Individual Bar */}
              <div className="charts1">
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
