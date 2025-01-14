import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function UserDashboard() {
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeamDetails = async (userEmail) => {
      try {
        const teamsRef = collection(db, "teams");
        const q = query(teamsRef);
        const querySnapshot = await getDocs(q);

        let foundTeam = null;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const memberEmails = data.members.map((member) => member.email);
          if (memberEmails.includes(userEmail)) {
            foundTeam = { teamName: data.teamName, members: data.members };
          }
        });

        if (foundTeam) {
          setTeamDetails(foundTeam);
        } else {
          setError("No team found for this user.");
        }
      } catch (err) {
        setError("Error fetching team details.");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchTeamDetails(user.email);
      } else {
        setError("User not logged in.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-black p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">User Dashboard</h1>
      
      {loading ? (
        <p className="text-center text-lg">Loading team details...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Team: {teamDetails.teamName}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamDetails.members.map((member, index) => (
              <div key={index} className="bg-white shadow-md rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-2">{member.name}</h2>
                <p><strong>Email:</strong> {member.email}</p>
                <p><strong>Phone:</strong> {member.phone}</p>
                <p><strong>College:</strong> {member.collegeName}</p>
                {member.github && (
                  <p>
                    <strong>GitHub:</strong>{" "}
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600"
                    >
                      {member.github}
                    </a>
                  </p>
                )}
                {member.linkedin && (
                  <p>
                    <strong>LinkedIn:</strong>{" "}
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600"
                    >
                      {member.linkedin}
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
