import { useEffect, useState } from 'react';

const useMentorTeamAttendance = (API_BASE) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeamAndAttendance = async () => {
      try {
        const mentorId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_BASE}/api/members/mentor/${mentorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch team members');
        const members = await res.json();
        setTeamMembers(members);

        const attendanceResults = {};
        await Promise.all(
          members.map(async (member) => {
            try {
              const res = await fetch(`${API_BASE}/api/members/${member._id}/attendance`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (res.ok) {
                const data = await res.json();
                attendanceResults[member._id] = Array.isArray(data.attendance) ? data.attendance : [];
              } else {
                attendanceResults[member._id] = [];
              }
            } catch {
              attendanceResults[member._id] = [];
            }
          })
        );

        setAttendanceMap(attendanceResults);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamAndAttendance();
  }, [API_BASE]);

  return { teamMembers, attendanceMap, loading, error };
};

export default useMentorTeamAttendance;
