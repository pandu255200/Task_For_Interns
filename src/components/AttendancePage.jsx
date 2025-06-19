import React, { useEffect, useState } from "react";
import "./AttendancePage.css";
import "./adduser.css";

const AttendancePage = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [fetchedAttendance, setFetchedAttendance] = useState({});
  const [message, setMessage] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', mentorId: '' });
  const [addUserMessage, setAddUserMessage] = useState('');
  const [mentors, setMENTORS] = useState([]);

  // Delete functionality
  const [showDeleteUserForm, setShowDeleteUserForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [searchTermToDelete, setSearchTermToDelete] = useState('');
  const [filteredMembersToDelete, setFilteredMembersToDelete] = useState([]);
  const [deleteUserMessage, setDeleteUserMessage] = useState('');

  // Format current date in India
  const today = new Date().toLocaleDateString("en-CA");
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const API_URL = "http://localhost:5000";

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/auth/Register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: "intern",
          mentor: newUser.mentorId ,
           dateOfJoining: newUser.dateOfJoining
        })
      });

      const data = await res.json();

      if (res.ok) {
        setAddUserMessage("User added successfully.");
        setNewUser({ name: "", email: "", password: "", mentorId: '', dateOfJoining: ''  });
        setShowAddUserForm(false);
        // Refresh members
        const membersRes = await fetch(`${API_BASE}/api/members`);
        const members = await membersRes.json();
        setMembers(members);
        setFilteredMembers(members);
      } else {
        setAddUserMessage(data.error);
      }
    } catch (error) {
      console.error(error);
      setAddUserMessage(error.message);
    }
  };

  // Initial fetch for members and mentors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const membersRes = await fetch(`${API_BASE}/api/members`);
        const membersData = await membersRes.json();
        setMembers(membersData);
        setFilteredMembers(membersData);

        const mentorsRes = await fetch(`${API_BASE}/api/mentors`);
        const mentorsData = await mentorsRes.json();
        setMENTORS(mentorsData);

        setSelectedDate(today);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  // Filter members by search term
  useEffect(() => {
    const results = members.filter((member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) 
    );
    setFilteredMembers(results);
  }, [searchTerm, members]);

  // Fetch attendance when selectedDate or members change
  useEffect(() => {
    if (selectedDate && members.length > 0) {
      fetchAllAttendance(selectedDate);
    }
  }, [selectedDate, members]);

  const fetchAllAttendance = async (selectedDate) => {
    setIsLoading(true);
    setMessage('');
    try {
      const parsedDate = new Date(selectedDate).toLocaleDateString();
      const attendanceRecords = {};

      for (const member of members) {
        const res = await fetch(
          `${API_BASE}/api/members/members/${member._id}/attendance`
        );

        if (res.ok) {
          const data = await res.json();
          const matching = data.attendance.find(
            (item) => new Date(item.date).toLocaleDateString() === parsedDate
          );

          attendanceRecords[member._id] = matching
            ? matching
            : { present: false, leaveReason: '' };
        } else {
          attendanceRecords[member._id] = { present: false, leaveReason: '' };
        }
      }

      setFetchedAttendance(attendanceRecords);
      setMessage("Attendance data fetched successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete functionality
  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/members/members/${selectedMemberId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        // Update all relevant states
        setMembers(prev => prev.filter(m => m._id !== selectedMemberId));
        setFilteredMembers(prev => prev.filter(m => m._id !== selectedMemberId));
        setFilteredMembersToDelete(prev => prev.filter(m => m._id !== selectedMemberId));
        
        // Remove attendance record for deleted member
        setFetchedAttendance(prev => {
          const newAttendance = {...prev};
          delete newAttendance[selectedMemberId];
          return newAttendance;
        });

        setDeleteUserMessage("Member deleted successfully.");
        setSelectedMemberId('');
        setSearchTermToDelete('');
      } else {
        const data = await res.json();
        setDeleteUserMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setDeleteUserMessage(error.toString()); 
    }
  };

  // Filter members for delete search
  useEffect(() => {
    if (searchTermToDelete.trim()) {
      const results = members.filter(m =>
        m.name.toLowerCase().includes(searchTermToDelete.toLowerCase())
      );
      setFilteredMembersToDelete(results);
    } else {
      setFilteredMembersToDelete([]);
    }
  }, [searchTermToDelete, members]);

  return (
    <div className="attendance-page">
      <button
        
        onClick={() => setShowAddUserForm((prev) => !prev)}
        disabled={isLoading}
      >
        {showAddUserForm ? "Close" : "Add New User"}
      </button>

      <button
        disabled={isLoading}
        onClick={() => setShowDeleteUserForm((prev) => !prev)}
      >
        {showDeleteUserForm ? "Close Delete User" : "Delete User"}
      </button>

      {/* Add User Form */}
      {showAddUserForm && (
        <div className="add-user-form">
          <form onSubmit={handleAddUser}>
            <button
              className="closes"
              aria-label="Close form"
              disabled={isLoading}
              type="button"
              onClick={() => setShowAddUserForm(false)}
            >
              &times;
            </button>
            <h3>Add User</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              disabled={isLoading}
              required
            /><br/>
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              disabled={isLoading}
              required
            /><br/>
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              disabled={isLoading}
              required
            /><br/>
            <select
              disabled={isLoading}
              value={newUser.mentorId}
              onChange={(e) => setNewUser({ ...newUser, mentorId: e.target.value })}
              required
            >
              <option value="">Select Mentor</option>
              {mentors.map((mentor) => (
                <option key={mentor._id} value={mentor._id}>
                  {mentor.name}
                </option>
              ))}
            </select><br />
            <p className="joins">Joining Date: </p>
            <input
  disabled={isLoading}
  type="date"
  value={newUser.dateOfJoining}
  onChange={(e) => setNewUser({ ...newUser, dateOfJoining: e.target.value })}
  required
/>
            <button disabled={isLoading} type="submit">
              {isLoading ? "Creating..." : "Add User"}
            </button>
            {addUserMessage && <p>{addUserMessage}</p>}
          </form>
        </div>
      )}

      {/* Delete User Form */}
      {showDeleteUserForm && (
        <div className="add-user-form">
          <form onSubmit={handleConfirmDelete}>
            <button
              className="closes"
              aria-label="Close form"
              disabled={isLoading}
              type="button"
              onClick={() => {
          console.log("Close clicked");
          setShowDeleteUserForm(false);
        }}
            >
              &times;
            </button>
            <h3>Delete User</h3>
            <input
              type="text"
              placeholder="Search by name"
              value={searchTermToDelete}
              onChange={(e) => setSearchTermToDelete(e.target.value)}
              disabled={isLoading}
            /><br/>
            {filteredMembersToDelete.length > 0 ? (
              <select
                disabled={isLoading}
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                required
              >
                <option value="">Select Member</option>
                {filteredMembersToDelete.map((mem) => (
                  <option key={mem._id} value={mem._id}>
                    {mem.name}
                  </option>
                ))}
              </select>
            ) : searchTermToDelete ? (
              <p>No members found matching "{searchTermToDelete}"</p>
            ) : null}
            <br/>
            <button 
              disabled={isLoading || !selectedMemberId} 
              type="submit"
            >
              {isLoading ? "Deleting..." : "Delete User"}
            </button>
            {deleteUserMessage && <p>{deleteUserMessage}</p>}
          </form>
        </div>
      )}

      <h2>View Attendance</h2>
      {message && (
        <p className={`message ${isLoading ? "processing" : ""}`}>
          {message}
        </p>
      )}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by member name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
          className="search-input"
        />
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
            <th>Attendance</th>
            <th>Leave</th>
             <th>Joining Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers
            .filter((member) => member.role === "intern")
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((member) => {
              const attendance = fetchedAttendance[member._id];
              return (
                <tr key={member._id}>
                  <td>{member.name}</td>
                  <td>{new Date(selectedDate).toLocaleDateString()}</td>
                  <td style={{ 
                    backgroundColor: attendance?.leaveReason ? "rgb(215 200 88)" : 
                    attendance?.present ? "#d0f0c0" : "rgb(196 136 132)" 
                  }}>
                    {attendance?.present ? "Yes" : "No"}
                  </td>
                  <td style={{ 
                    backgroundColor: attendance?.leaveReason ? "white" : '' 
                  }}>
                    {attendance?.leaveReason ? attendance.leaveReason : ""}
                  </td>
                  <td>
          {member.dateOfJoining ? new Date(member.dateOfJoining).toLocaleDateString() : ""}
        </td>
                </tr>
              );
            })}
        </tbody>
      </table>

   <div className="color-legend">
  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
    <li style={{ marginBottom: "10px" }}>
      <span
        style={{ 
          backgroundColor: "#d0f0c0", 
          color: "black", 
          padding: "5px 10px", 
          borderRadius: "5px",
          marginRight: "17px" 
        }}>
        Present
      </span> 
      - Present
    </li>

    <li style={{ marginBottom: "10px" }}>
      <span
        style={{ 
          backgroundColor: "rgb(215 200 88)", 
          padding: "5px 10px", 
          borderRadius: "5px",
          marginRight: "10px" 
        }}>
        On leave
      </span> 
      - The person has notified in advance about their leave.
    </li>

    <li style={{ marginBottom: "10px" }}>
      <span
        style={{ 
          backgroundColor: "rgb(196 136 132)", 
          color: "black", 
          padding: "5px 10px", 
          borderRadius: "5px",
          marginRight: "22px" 
        }}>
        Absent
      </span> 
      - Absent for the past week without any communication.
    </li>
  </ul>
</div>


    </div>
  );
};

export default AttendancePage;