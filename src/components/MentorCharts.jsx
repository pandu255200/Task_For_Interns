import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import './styles/MentorCharts.css';

const API_URL = process.env.REACT_APP_API_BASE_URL;
const COLORS = ['#4caf50', '#ff9800', '#f44336'];

const MentorTaskCharts = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [teamStats, setTeamStats] = useState({ completed: 0, pending: 0, inprogress: 0 });
  const [individualStats, setIndividualStats] = useState({ completed: 0, pending: 0, inprogress: 0 });
  const [loading, setLoading] = useState(true);

  const fetchTaskStats = async (tasks, filterByMemberId = null) => {
    const filtered = filterByMemberId
      ? tasks.filter(t => t.assignedTo?._id === filterByMemberId)
      : tasks;

    return {
      completed: filtered.filter(t => t.status.toLowerCase() === 'completed').length,
      inprogress: filtered.filter(t => t.status.toLowerCase() === 'in progress').length,
      pending: filtered.filter(t => t.status.toLowerCase() === 'pending').length,
    };
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const mentorId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        const membersRes = await axios.get(`${API_URL}/api/members/mentor/${mentorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const taskRes = await axios.get(`${API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const memberIds = membersRes.data.map(m => m._id);
        const teamTasks = taskRes.data.filter(t => memberIds.includes(t.assignedTo?._id));

        setTeamMembers(membersRes.data);
        setTeamStats(await fetchTaskStats(teamTasks));
        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    const fetchIndividual = async () => {
      if (!selectedMemberId) return;

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const taskRes = await axios.get(`${API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const stats = await fetchTaskStats(taskRes.data, selectedMemberId);
        setIndividualStats(stats);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load individual stats:', err);
        setLoading(false);
      }
    };

    fetchIndividual();
  }, [selectedMemberId]);
    const renderChartBlock = (title, stats, type) => {
  const pieData = [
    { name: 'Completed', value: stats.completed },
    { name: 'In Progress', value: stats.inprogress },
    { name: 'Pending', value: stats.pending },
  ];

  const barData = [{
    name: 'Tasks',
    Completed: stats.completed,
    'In Progress': stats.inprogress,
    Pending: stats.pending,
  }];

  const total = stats.completed + stats.inprogress + stats.pending;
const isDistributionChart = title.toLowerCase().includes("distribution");
const showPercentageLabel = isDistributionChart;



  return (
    <div className="chart-box">
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Legend verticalAlign="bottom" height={36} />
          <Pie
            data={pieData}
            dataKey="value"
            
            outerRadius={80}
           label={
  showPercentageLabel
    ? ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
          <text
            x={x}
            y={y}
            fill="black"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            style={{ fontSize: '12px' }}
          >
            {`${name}: ${(percent * 100).toFixed(1)}%`}
          </text>
        );
      }
    : ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
          <text
            x={x}
            y={y}
            fill="black"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            style={{ fontSize: '12px' }}
          >
            {`${name}: ${value}`}
          </text>
        );
      }
}

            labelLine={false}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
         <Tooltip
  formatter={(value, name) =>
    showPercentageLabel
      ? [`${value} (${((value / total) * 100).toFixed(1)}%)`, name]
      : [`${value}`, name]
  }
/>

        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};



  return (
    <div className="charts-container">
      <h2 className="charts-title">📊 Team Task Overview</h2>
  {loading && <p>Loading...</p>}

      <div className="dropdown-container">
        <label>🔽 Select Member:</label>
        <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}>
          <option value="">-- Choose Member --</option>
          {teamMembers.map((m) => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>
      </div>

    {!loading && (
  <div className="charts-grid">
    {renderChartBlock("Team Distribution", teamStats, 'pie')}
    {renderChartBlock("Team Count", teamStats, 'bar')}
    {selectedMemberId && (
      <>
        {renderChartBlock("Individual Distribution", individualStats, 'pie')}
        {renderChartBlock("Individual Count", individualStats, 'bar')}
      </>
    )}
  </div>
)}

    </div>
  );
};

export default MentorTaskCharts;
