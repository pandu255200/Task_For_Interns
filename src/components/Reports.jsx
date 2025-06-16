import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

import "./reports.css";

const Reports = () => {
  const [tasks, setTasks] = useState([]);
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const API_URL = 'http://localhost:5000'

  useEffect(() => {
    fetch(`${API_BASE}/api/tasks`)
      .then((res) => res.json()) // make sure your API responds with a list of tasks
      .then((data) => setTasks(data))
      .catch((error) => console.error(error));
  }, []);

  // Count by status
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

  const COLORS = ["#4caf50", "#ff9800", "#f44336"];

  return (
    <div className="reports-container">
      <h1>Reports</h1>

      <div className="charts-wrapper">
        <div className="charts">
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

        <div className="charts">
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
  );
};

export default Reports;
