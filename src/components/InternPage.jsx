
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./styles/InternPage.css";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './styles/InternPage.css';


const InternPage = () => {
  const [attendance, setAttendance] = useState([]);
  const [showAttendance, setShowAttendance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [markPresent, setMarkPresent] = useState(true);
  const [leaveReason, setLeaveReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [markSuccess, setMarkSuccess] = useState(null);


  const memberId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

 


  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/members/${memberId}/attendance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg);
      }
      const data = await res.json();
      setAttendance(data.attendance);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMarkSuccess(null);
    setError(null);

    try {

    
      const res = await fetch(`${API_BASE}/api/members/${memberId}/attendance`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toISOString(),
          present: markPresent,
          leaveReason: leaveReason.trim(),
          status: "pending"
        })
      });


      const responseData = await res.json();

      if (!res.ok) {
        if (responseData.error === "Attendance already marked for this date") {
          setMarkSuccess(" Attendance already marked for today.");
          return;
        }
        throw new Error(responseData.error || "Something went wrong.");
      }


      setMarkSuccess(
        "✅ Attendance marked successfully and sent for mentor approval."
      );

      setMarkSuccess('✅ Attendance marked successfully and sent for mentor approval.');

      setAttendance(responseData.attendance);
      setMarkPresent(true);
      setLeaveReason("");
    } catch (err) {
      setError(err.toString());
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);




  const hasMarkedToday = attendance?.some(entry =>
    new Date(entry.date).toDateString() === new Date().toDateString()

  );

  return (
    <div className="intern-page">
      <h2 className="intern-name">Welcome {name ? name : "Intern"}</h2>

      <h3>Mark Your Attendance</h3>
      {markSuccess && <p className="success">{markSuccess}</p>}
      {error && <p className="error">Error: {error}</p>}

      {hasMarkedToday ? (
        <p className="info">✅ You’ve already marked your attendance today.</p>
      ) : (
        <form onSubmit={handleMarkAttendance}>
          <label>
            <input
              type="radio"
              name="mark"
              value="present"
              checked={markPresent}
              onChange={() => setMarkPresent(true)}
            />
            Present
          </label>

          <label>
            <input
              type="radio"
              name="mark"
              value="absent"
              checked={!markPresent}
              onChange={() => setMarkPresent(false)}
            />
            Absent
          </label>

          {!markPresent && (
            <input
              type="text"

              placeholder='Reason for absence'

              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              required
            />
          )}


          <button disabled={submitting} type="submit">
            {submitting ? "Submitting..." : "Submit"}

          <button disabled={submitting} type='submit'>
            {submitting ? 'Submitting...' : 'Submit'}

          </button>
        </form>
      )}


      <button
        className="history-button"
        onClick={() => {
          setShowAttendance(true);
          fetchAttendance();
        }}
      >
=======
      <button className="history-button" onClick={() => { setShowAttendance(true); fetchAttendance(); }}>

        View Attendance History
      </button>

      {showAttendance && (
        <div className="modal">
          <div className="modal-content">
            <h4>Your Attendance History</h4>

            {loading && <p>Loading attendance...</p>}
            {error && <p className="error">Error: {error}</p>}

            {attendance && (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Present</th>
                    <th>Leave Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((item, index) => (
                    <tr key={index}>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>{item.present ? "Yes" : "No"}</td>
                      <td>{item.leaveReason || "-"}</td>
                      
                        {item.status === "approved" && (
                          <span className="status approved">Approved</span>
                        )}
                        {item.status === "rejected" && (
                          <span className="status rejected">Rejected</span>
                        )}
                        {item.status === "pending" && (
                          <span className="status pending">Pending</span>
                        )}

                      <td>{item.present ? 'Yes' : 'No'}</td>
                      <td>{item.leaveReason || '-'}</td>
                      <td>
                        {item.status === 'approved' && <span className="status approved">Approved</span>}
                        {item.status === 'rejected' && <span className="status rejected">Rejected</span>}
                        {item.status === 'pending' && <span className="status pending">Pending</span>}

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}


            <button
              className="close-button"
              onClick={() => setShowAttendance(false)}
            >
              Close
            </button>

            <button className="close-button" onClick={() => setShowAttendance(false)}>Close</button>

            <Link to="/intern/tasks" />
          </div>
        </div>
      )}
    </div>
  );
};

export default InternPage;
