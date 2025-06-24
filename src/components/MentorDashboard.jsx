// src/components/MentorDashboard.jsx
import React, { useState } from 'react';
import useMentorTeamAttendance from './hooks/useMentorTeamAttendance';
import './styles/MentorDashboard.css';

const MentorDashboard = () => {
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const {
    teamMembers,
    attendanceMap,
    loading,
    error,
    refreshData
  } = useMentorTeamAttendance(API_BASE);

  const [selectedAttendance, setSelectedAttendance] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('token');
  const mentorId = localStorage.getItem('userId');

  const renderAttendanceSummary = (records) => {
    if (!Array.isArray(records)) return 'No records';
    const presentDays = records.filter(r => r.present && r.status === 'approved').length;
    return `${presentDays}/${records.length} Present`;
  };

  const openAttendanceModal = (memberId, memberName) => {
    setSelectedAttendance(attendanceMap[memberId] || []);
    setSelectedMemberId(memberId);
    setSelectedMemberName(memberName);
    setShowModal(true);
  };

 const handleReview = async (attendanceId, status) => {
  try {
    const res = await fetch(`${API_BASE}/api/attendance/${selectedMemberId}/${attendanceId}/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status, mentorId })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update');
    }

    // Instead of refreshData() + reading from updated attendanceMap,
    // fetch only selected member’s attendance
    const res2 = await fetch(`${API_BASE}/api/members/${selectedMemberId}/attendance`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res2.json();
    setSelectedAttendance(data.attendance || []);

  } catch (err) {
    alert('Error: ' + err.message);
  }
};


  return (
    <div className="mentor-dashboard">
      <h2>Team Members</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="team-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Date of Joining</th>
              <th>Role</th>
              <th>Attendance</th>
              <th>Attendance History</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member._id}>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{new Date(member.dateOfJoining).toLocaleDateString()}</td>
                <td>{member.role}</td>
                <td>{renderAttendanceSummary(attendanceMap[member._id])}</td>
                <td>
                  <button
                    className="view-button"
                    onClick={() => openAttendanceModal(member._id, member.name)}
                  >
                    👁 View Attendance
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Attendance Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📅 {selectedMemberName}'s Attendance</h3>
            <button className="close-buttons" onClick={() => setShowModal(false)}>❌ Close</button>
            <ul className="attendance-list">
              {selectedAttendance.length === 0 ? (
                <li>No attendance records.</li>
              ) : (
                selectedAttendance.map((att, index) => (
                  <li key={att._id || index}>
                    {new Date(att.date).toLocaleDateString()} - 
                    {att.present ? '✅ Present' : `❌ Absent (${att.leaveReason || 'No reason'})`} - 
                    <strong>{att.status}</strong>

                    {att.status === 'pending' && (
                      <>
                        <button className="approve" onClick={() => handleReview(att._id, 'approved')}>Approve</button>
                        <button className="reject" onClick={() => handleReview(att._id, 'rejected')}>Reject</button>
                      </>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
