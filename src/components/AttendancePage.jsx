import React, { useEffect, useState } from 'react';
import './AttendancePage.css';

const AttendancePage = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [fetchedAttendance, setFetchedAttendance] = useState({});
  const [message, setMessage] = useState('');
  
  // Format current date in India
  const today = new Date().toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const API_URL = 'http://localhost:5000'

  // Initial fetch for members
  useEffect(() => {
    fetch(`${API_BASE}/api/members`)
      .then((res) => res.json()) 
      .then((data) => {
        setMembers(data);
        setFilteredMembers(data);
      })
      .catch((err) => console.error('Error fetching members!', err));

    setSelectedDate(today);
  }, []);

  // Filter members by search term
  useEffect(() => {
    const results = members.filter((member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) 
    );
    setFilteredMembers(results);
  }, [searchTerm, members]);

  // Whenever selectedDate or members are updated, fetch attendance
  useEffect(() => {
    if (selectedDate && members.length > 0) {
      fetchAllAttendance(selectedDate);
    }
  }, [selectedDate, members]);

  const fetchAllAttendance = async (selectedDate) => {
    setIsLoading(true);
    setMessage('');
    try {
      // Format the date to match the format used in your API
      const parsedDate = new Date(selectedDate).toLocaleDateString();

      // Loop through all members and fetch their attendance for the specified date
      const attendanceRecords = {};

      for (const member of members) {
        const res = await fetch(`${API_BASE}/api/members/members/${member._id}/attendance`);

        if (res.ok) {
          const data = await res.json();

          // Find matching attendance for parsedDate
          const matching = data.attendance.find((item) =>
            new Date(item.date).toLocaleDateString() === parsedDate
          );

          attendanceRecords[member._id] = matching ? matching : { present: false, leaveReason: '' };
        } else {
          attendanceRecords[member._id] = { present: false, leaveReason: '' };
        }
      }

      setFetchedAttendance(attendanceRecords);
      setMessage('Attendance data fetched successfully');
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="attendance-page">
      <h2>View Attendance</h2>

      {message && <p className={`message ${isLoading ? 'processing' : ''}`}>{message}</p>}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by member name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
          className="search-input"
        />

        {/* Date picker for attendance */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          disabled={isLoading}
          className="date-picker"
        />
      </div>

    <table>
  <thead>
    <tr>
      <th>Member</th>
      <th>Date</th>
      <th>Present</th>
      <th>Leave</th>
    </tr>
  </thead>
  <tbody>
    {filteredMembers
      .filter((member) => member.role === 'intern') // Filter for interns
      .sort((a, b) => a.name.localeCompare(b.name)) // Sort by name
      .map((member) => {
        // Retrieve this member's attendance by their IDs
        const attendance = fetchedAttendance[member._id];
        return (
          <tr key={member._id}>
            <td>{member.name}</td>
            <td>{new Date(selectedDate).toLocaleDateString()}</td>
            <td
              style={{ 
                backgroundColor: attendance?.leaveReason ? 'blue' : (attendance?.present ? 'green' : 'red')
              }}>
              {attendance?.present ? 'Yes' : 'No'}
            </td>
            <td
              style={{ 
                backgroundColor: attendance?.leaveReason ? 'yellow' : '' 
              }}>
              {attendance?.leaveReason ? attendance.leaveReason : ''}
            </td>
          </tr>
        );
      })}
  </tbody>
</table>




    </div>
  );
};

export default AttendancePage;

