import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function UserDashboard() {
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false); 
  const [updatedMembers, setUpdatedMembers] = useState([]);
  const [userRole, setUserRole] = useState(null); 


  const timelineEvents = [
    { id: 1, name: "Registration", status: "completed", date: "Feb 15, 2024" },
    { id: 2, name: "Team Formation", status: "completed", date: "Feb 16, 2024" },
    { id: 3, name: "Problem Statement", status: "completed", date: "Feb 17, 2024" },
    { id: 4, name: "First Review", status: "inProgress", date: "Feb 18, 2024" },
  ];


  const notices = [
    { date: "14 Feb 2024", title: "Hackathon Kickoff", content: "Welcome to TechInnovate 2024! Get ready for 48 hours of coding, innovation, and fun. Check your email for important details." },
    { date: "15 Feb 2024", title: "Mentor Assignment", content: "Mentors have been assigned to all teams. Schedule your first meeting ASAP." },
    { date: "16 Feb 2024", title: "Workshop Alert", content: "Don't miss our AWS deployment workshop at 3 PM today!" },
    { date: "17 Feb 2024", title: "Submission Guidelines", content: "Updated submission guidelines are now available. Please review them carefully." },
  ];


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
            const currentMember = data.members.find(member => member.email === userEmail);
            setUserRole(currentMember?.role || null);
          }
        });
  
        if (foundTeam) {
          setTeamDetails(foundTeam);
          setUpdatedMembers(foundTeam.members);
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


  useEffect(() => {
    if (auth.currentUser && teamDetails) {
      const currentMember = teamDetails.members.find(
        member => member.email === auth.currentUser.email
      );
      setUserRole(currentMember?.role || null);
    }
  }, [teamDetails]); 


  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };


  const handleMemberUpdate = (id, field, value) => {
    const updatedMembersList = [...updatedMembers];
    updatedMembersList[id] = { ...updatedMembersList[id], [field]: value };
    setUpdatedMembers(updatedMembersList);
  };


  const handleSaveClick = async () => {
    try {
      const teamRef = doc(db, "teams", teamDetails.teamName); 
      await updateDoc(teamRef, {
        members: updatedMembers,
      });
      setIsEditing(false);
      setTeamDetails({ ...teamDetails, members: updatedMembers }); 
    } catch (error) {
      setError("Error updating member info.");
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="border-t-4 border-blue-500 border-solid w-16 h-16 rounded-full animate-spin"></div>
      </div>
    );
  }


  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }


  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-black hover:text-blue-500 transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-3xl bg-gradient-to-r from-blue-600 to-blue-400 font-bold bg-clip-text text-transparent">
              {teamDetails?.teamName || "Dashboard"}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Timeline Section */}
        <div className="bg-gray-400 rounded-3xl bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-20 border-4 border-gray-100 p-5 shadow-lg">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Timeline
          </h2>
          <div className="relative flex overflow-x-auto scrollbar-hide space-x-8">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="relative flex items-center">
                {/* Connector Line */}
                {index > 0 && (
                  <div
                    className={`absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full w-full h-1 ${
                      index <= 2 ? "bg-green-500" : "bg-gray-300"
                    } z-0`}
                  ></div>
                )}

                {/* Event Box */}
                <div
                  className={`relative z-10 flex flex-col items-center text-center p-4 rounded-lg shadow-md w-36 h-40 ${
                    event.status === "completed"
                      ? "bg-green-100 border border-green-500"
                      : event.status === "inProgress"
                      ? "bg-blue-100 border border-blue-500"
                      : "bg-gray-200 border border-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      event.status === "completed"
                        ? "bg-green-500 text-white"
                        : event.status === "inProgress"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-400 text-white"
                    }`}
                  >
                    {event.status === "completed" ? "✓" : index + 1}
                  </div>
                  <span className="text-sm font-semibold">{event.date}</span>
                  <span
                    className={`mt-1 px-3 py-1 rounded-full text-xs ${
                      event.status === "completed"
                        ? "bg-green-200 text-green-600"
                        : event.status === "inProgress"
                        ? "bg-blue-200 text-blue-600"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {event.status}
                  </span>
                  <p className="mt-2 text-sm text-gray-700">{event.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notices Section */}
        <div className="bg-gray-400 rounded-3xl bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-20 border-4 border-gray-100 p-6 overflow-y-auto shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            Notices
          </h2>
          {notices[0] ? (
            <div className="mb-4 bg-gray-200 rounded-lg p-4 hover:bg-gray-300 transition-colors Notice-sec">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 text-sm">{notices[0].date}</span>
                <span className="bg-blue-200 text-blue-600 px-2 py-1 rounded-full text-xs">
                  New
                </span>
              </div>
              <h3 className="font-medium mb-2">{notices[0].title}</h3>
              <p className="text-sm text-gray-600">{notices[0].content}</p>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No notices available.</p>
          )}
        </div>
      </div>

    <div className="bg-gray-400 rounded-3xl bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-20 border-4 border-gray-100 p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          Team Members
        </h2>
        {userRole === "Leader" && (
          <button
            onClick={isEditing ? handleSaveClick : handleEditClick}
            className="bg-blue-500 text-white rounded px-4 py-2"
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {updatedMembers.map((member, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center">
                  <img
                    src={member.photo || "/default-avatar.png"} 
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-600"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <input
                      className="w-full bg-gray-100 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 transition-all text-lg font-semibold"
                      value={member.name}
                      onChange={(e) =>
                        handleMemberUpdate(index, "name", e.target.value)
                      }
                      placeholder="Full Name"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      className="w-full bg-gray-100 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
                      value={member.email}
                      onChange={(e) =>
                        handleMemberUpdate(index, "email", e.target.value)
                      }
                      placeholder="Email Address"
                      disabled={!isEditing}
                    />
                    <input
                      className="w-full bg-gray-100 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
                      value={member.phone}
                      onChange={(e) =>
                        handleMemberUpdate(index, "phone", e.target.value)
                      }
                      placeholder="Contact Number"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">College</label>
                    <input
                      className="w-full bg-gray-100 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
                      value={member.collegeName}
                      onChange={(e) =>
                        handleMemberUpdate(index, "collegeName", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* GitHub */}
                  {isEditing ? (
                    <input
                      className="w-full bg-gray-100 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
                      value={member.github}
                      onChange={(e) =>
                        handleMemberUpdate(index, "github", e.target.value)
                      }
                      placeholder="GitHub URL"
                    />
                  ) : (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-gray-100 rounded px-4 py-2 hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.386 1.237-3.23-.124-.305-.537-.829.099-1.736 0 0 1.015-.326 3.287 1.237.954-.267 1.98-.4 2.998-.404 1.018.004 2.044.137 2.998.404 2.272-1.563 3.287-1.237 3.287-1.237 0 .907.223 1.431.099 1.736.768.844 1.237 1.919 1.237 3.23 0 4.601-2.808 5.624-5.478 5.93.433.37.813 1.107.813 2.229v3.293c0 .317.188.694.804.577C20.564 21.8 24 17.302 24 12c0-6.627-5.373-12-12-12z"></path>
                      </svg>
                      GitHub
                    </a>
                  )}
                  {/* LinkedIn */}
                  {isEditing ? (
                    <input
                      className="w-full bg-gray-100 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
                      value={member.linkedin}
                      onChange={(e) =>
                        handleMemberUpdate(index, "linkedin", e.target.value)
                      }
                      placeholder="LinkedIn URL"
                    />
                  ) : (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-gray-100 rounded px-4 py-2 hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 0v24H0V0h24z" fill="none"></path>
                        <path d="M9.147 9.147c0-2.89 2.358-5.147 5.147-5.147 2.89 0 5.148 2.358 5.148 5.147s-2.358 5.147-5.148 5.147c-2.789 0-5.147-2.358-5.147-5.147zm-.724 0c0 3.362 2.719 6.147 6.147 6.147 3.362 0 6.148-2.719 6.148-6.147s-2.719-6.147-6.148-6.147c-3.428 0-6.147 2.719-6.147 6.147zM16.96 9.763h-4.604V7.59h4.604v2.174zm-4.604 1.041H16.96v5.848H12.356zm3.059 1.327v2.434h-3.051V12.26H12.356V7.59h3.157v5.847z"></path>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-1">
                  <a
                    href={member.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gray-100 rounded px-4 py-2 hover:bg-gray-200 transition-colors"
                  >
                    <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    >
                      <path d="M4 2C3.447 2 3 2.447 3 3v18c0 .553.447 1 1 1h16c.553 0 1-.447 1-1V8.414c0-.265-.105-.52-.293-.707l-5.414-5.414A.997.997 0 0014.586 2H4zm0 1h10v5h5v12H4V3zm12 0.586L18.414 7H16V3.586z" />
                    </svg>
                  Resume
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}

export default UserDashboard;
