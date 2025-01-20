import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaGithub, FaLinkedin, FaUniversity, FaImage, FaFileAlt, FaArrowLeft } from "react-icons/fa";
import { useDropzone } from 'react-dropzone';
import { db } from "../firebase"; 
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function FileDropZone({ onDrop, acceptedFormats, label, icon: Icon }) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: acceptedFormats,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-3xl p-6 text-black bg-white hover:bg-gray-100 focus:ring focus:ring-indigo-300"
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center">
        <Icon className="text-black text-2xl mb-2" />
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-gray-500">Drag & Drop or Click to Upload</p>
      </div>
    </div>
  );
}

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    teamName: "",
    member: {
      name: "",
      email: "",
      phone: "",
      github: "",
      linkedin: "",
      collegeName: "",
      photo: null,
      resume: null,
    },
    alertMessage: "",
    alertType: "",
  });

  const location = useLocation();
  const navigate = useNavigate();
  const storage = getStorage();

  const MAX_FILE_SIZE = 100 * 1024; 

  const handleFileSizeValidation = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setFormData((prevData) => ({
        ...prevData,
        alertMessage: "File size exceeds 100 KB limit.",
        alertType: "error",
      }));
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        setFormData((prevData) => ({
          ...prevData,
          alertMessage: "",
          alertType: "",
        }));
      }, 3000);
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      member: { ...prevData.member, [e.target.name]: e.target.value },
    }));
    clearError();
  };

  useEffect(() => {
    if (location.state?.email) {
      setFormData((prevData) => ({
        ...prevData,
        member: { ...prevData.member, email: location.state.email },
      }));
    }
  }, [location]);

  const validatePhoneNumber = (phone) => {
    const regex = /^\d+$/; 
    return regex.test(phone);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  
  //   if (!formData.member.name || !formData.member.email || !formData.member.phone || !formData.member.collegeName) {
  //     setFormData({
  //       ...formData,
  //       alertMessage: "Please fill all fields.",
  //       alertType: "error",
  //     });
  //     window.scrollTo({ top: 0, behavior: "smooth" });
  //     setTimeout(() => {
  //       setFormData({
  //         ...formData,
  //         alertMessage: "",
  //         alertType: "",
  //       });
  //     }, 3000);
  //     return;
  //   }
  
  //   if (formData.member.phone && !validatePhoneNumber(formData.member.phone)) {
  //     setFormData({
  //       ...formData,
  //       alertMessage: "Phone number must only contain digits.",
  //       alertType: "error",
  //     });
  //     window.scrollTo({ top: 0, behavior: "smooth" });
  //     setTimeout(() => {
  //       setFormData({
  //         ...formData,
  //         alertMessage: "",
  //         alertType: "",
  //       });
  //     }, 3000);
  //     return;
  //   }
  
  //   try {
  //     const teamRef = doc(db, "teams", formData.teamName);
  //     const teamDoc = await getDoc(teamRef);
  
  //     if (teamDoc.exists()) {
  //       const teamData = teamDoc.data();
  
  //       if (teamData.members.length < 3) {
  //         await updateDoc(teamRef, {
  //           members: arrayUnion({
  //             ...formData.member,
  //             role: "Member",
  //           }),
  //         });
  //         setFormData({
  //           ...formData,
  //           alertMessage: "Successfully joined the team!",
  //           alertType: "success",
  //         });
  //         setTimeout(() => navigate("/dashboard"), 3000);
  //       } else {
  //         setFormData({
  //           ...formData,
  //           alertMessage: "Team already has 3 members.",
  //           alertType: "error",
  //         });
  //         window.scrollTo({ top: 0, behavior: "smooth" });
  //         setTimeout(() => {
  //           setFormData({
  //             ...formData,
  //             alertMessage: "",
  //             alertType: "",
  //           });
  //         }, 3000);
  //         return;  
  //       }
  //     } else {
  //       await setDoc(teamRef, {
  //         teamName: formData.teamName,
  //         members: [{
  //           ...formData.member,
  //           role: "Leader",
  //         }],
  //       });
  //       setFormData({
  //         ...formData,
  //         alertMessage: "Team created and you are the leader!",
  //         alertType: "success",
  //       });
  //       setTimeout(() => navigate("/dashboard"), 3000);
  //     }
  //   } catch (error) {
  //     setFormData({
  //       ...formData,
  //       alertMessage: "Error registering team. Try again.",
  //       alertType: "error",
  //     });
  //     window.scrollTo({ top: 0, behavior: "smooth" });
  //     setTimeout(() => {
  //       setFormData({
  //         ...formData,
  //         alertMessage: "",
  //         alertType: "",
  //       });
  //     }, 3000);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.member.name || !formData.member.email || !formData.member.phone || !formData.member.collegeName) {
      setFormData({
        ...formData,
        alertMessage: "Please fill all fields.",
        alertType: "error",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        setFormData({
          ...formData,
          alertMessage: "",
          alertType: "",
        });
      }, 3000);
      return;
    }

    if (formData.member.phone && !validatePhoneNumber(formData.member.phone)) {
      setFormData({
        ...formData,
        alertMessage: "Phone number must only contain digits.",
        alertType: "error",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        setFormData({
          ...formData,
          alertMessage: "",
          alertType: "",
        });
      }, 3000);
      return;
    }

    try {
      const teamRef = doc(db, "teams", formData.teamName);
      const teamDoc = await getDoc(teamRef);

      if (teamDoc.exists()) {
        const teamData = teamDoc.data();

        if (teamData.members.length < 3) {
          await updateDoc(teamRef, {
            members: arrayUnion({
              ...formData.member,
              role: "Member",
            }),
          });
          setFormData({
            ...formData,
            alertMessage: "Successfully joined the team!",
            alertType: "success",
          });
          setTimeout(() => navigate("/dashboard"), 3000);
        } else {
          setFormData({
            ...formData,
            alertMessage: "Team already has 3 members.",
            alertType: "error",
          });
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => {
            setFormData({
              ...formData,
              alertMessage: "",
              alertType: "",
            });
          }, 3000);
          return;  
        }
      } else {
        await setDoc(teamRef, {
          teamName: formData.teamName,
          members: [{
            ...formData.member,
            role: "Leader",
          }],
          status: {
            "Registration": "completed",
            "Team Formation": "inProgress",  
            "Problem Statement": "pending",
            "First Review": "pending",
          }
        });

        setFormData({
          ...formData,
          alertMessage: "Team created and you are the leader!",
          alertType: "success",
        });
        setTimeout(() => navigate("/dashboard"), 3000);
      }
    } catch (error) {
      setFormData({
        ...formData,
        alertMessage: "Error registering team. Try again.",
        alertType: "error",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        setFormData({
          ...formData,
          alertMessage: "",
          alertType: "",
        });
      }, 3000);
    }
  };

  const clearError = () => {
    setFormData((prevState) => ({
      ...prevState,
      alertMessage: "",
      alertType: "",
    }));
  };

  const isTeamEligibleForUpload = async () => {
    try {
      const teamRef = doc(db, "teams", formData.teamName);
      const teamDoc = await getDoc(teamRef);
      if (teamDoc.exists() && teamDoc.data().members.length >= 3) {
        setFormData({
          ...formData,
          alertMessage: "Team already has 3 members. File uploads are disabled.",
          alertType: "error",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });

        setTimeout(() => {
          setFormData({
            ...formData,
            alertMessage: "",
            alertType: "",
          });
        }, 3000);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking team size:", error);
      setFormData({
        ...formData,
        alertMessage: "Error validating team size. Please try again.",
        alertType: "error",
      });
      setTimeout(() => {
        setFormData({
          ...formData,
          alertMessage: "",
          alertType: "",
        });
      }, 3000);
      return false;
    }
  };

  const [isLoading1, setIsLoading1] = useState(false);
  const handlePhotoDrop = async (acceptedFiles) => {
    if (!(await isTeamEligibleForUpload())) return;
  
    const file = acceptedFiles[0];
    
    if (!handleFileSizeValidation(file)) return;
  
    const storageRef = ref(storage, `photos/${formData.member.email}_${file.name}`);
    try {
      setIsLoading1(true);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
  
      setFormData((prevData) => ({
        ...prevData,
        member: { ...prevData.member, photo: photoURL },
        alertMessage: "Photo Uploaded Successfully",
        alertType: "success",
      }));
      
      setTimeout(() => {
        setFormData((prevData) => ({
          ...prevData,
          alertMessage: "",
          alertType: "",
        }));
      }, 3000);
  
      console.log("Photo uploaded successfully:", photoURL);
    } catch (error) {
      console.error("Error uploading photo:", error);
      setFormData({
        ...formData,
        alertMessage: "Error uploading photo. Please try again.",
        alertType: "error",
      });
      
      setTimeout(() => {
        setFormData({
          ...formData,
          alertMessage: "",
          alertType: "",
        });
      }, 3000);
      
    } finally {
      setIsLoading1(false);
    }
  };
  
  const [isLoading2, setIsLoading2] = useState(false);
  const handleResumeDrop = async (acceptedFiles) => {
    if (!(await isTeamEligibleForUpload())) return;
  
    const file = acceptedFiles[0];
  
    if (!handleFileSizeValidation(file)) return;
  
    const storageRef = ref(storage, `resumes/${formData.member.email}_${file.name}`);
  
    try {
      setIsLoading2(true); 
  
      await uploadBytes(storageRef, file);
  
      const resumeURL = await getDownloadURL(storageRef);
  
      setFormData((prevData) => ({
        ...prevData,
        member: { ...prevData.member, resume: resumeURL },
        alertMessage: "Resume Uploaded Successfully",
        alertType: "success",
      }));
      
      setTimeout(() => {
        setFormData((prevData) => ({
          ...prevData,
          alertMessage: "",
          alertType: "",
        }));
      }, 3000);
  
      console.log("Resume uploaded successfully:", resumeURL);
  
    } catch (error) {
      console.error("Error uploading resume:", error);
  
      setFormData((prevData) => ({
        ...prevData,
        alertMessage: "Error uploading resume. Please try again.",
        alertType: "error",
      }));
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      setTimeout(() => {
        setFormData((prevData) => ({
          ...prevData,
          alertMessage: "",
          alertType: "",
        }));
      }, 3000);
      
  
    } finally {
      setIsLoading2(false); 
    }
  };
  

  return (
    <div className="min-h-screen text-white pt-6 px-5 ">
      {/* Back Arrow and Heading */}
      <div className="flex items-center mb-6">
        <button
          className="text-white mr-4 bg-white p-2 rounded-full"
          onClick={() => window.history.back()}
        >
          <FaArrowLeft className="text-3xl text-black" />
        </button>
        <h1 className="text-3xl text-black font-bold">Algorithm 9.0 Team Registration</h1>
      </div>

      <div className="w-full max-w-[93rem] mx-auto grid gap-[1rem]">
        <div className="relative p-8 border-4 border-white rounded-3xl h-full bg-[url('assets/algo-logo.png')] bg-contain bg-center bg-no-repeat ">
          {/* Blur Layer */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl z-0 "></div>

          {/* Content Layer */}
          <div className="relative z-10 rounded-3xl bottom-4">
            <h2 className="text-4xl font-bold text-white">Instructions</h2>
            <ul className="list-disc pl-5 space-y-2 text-xl text-white grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-0">
              <li className="mt-2">Each member has to register individually.</li>
              <li>Member to register first is automatically the lead of the team.</li>
              
              <li>Choose a new team name to create a new team and share that team name with your teammates so that they can become part of your team.</li>
              <li>Use existing team name to register yourself as a part of existing team (team name is case & space sensitive).</li>
              <li>Each team can only have three members.</li>
              <li>Upload your Resume in .pdf or .docx (maximum size: 100 KB)</li>
              <li>Upload your Image in any image format (maximum size: 100 KB)</li>
              <li>LinkedIn Link : linkedin.com/in/profile-id</li>
              <li>GitHub Link : github.com/username</li>
              <li>Join this Whatsapp Group to solve your doubts: <a href="http://" target="_blank" rel="noopener noreferrer" className="text-white">Click to Join</a></li>
            </ul>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8 pt-[1rem] sm:h-[32rem] h-[51rem] w-full bg-gray-400 rounded-3xl bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-20 border-4 border-gray-100">
            
          {formData.alertMessage && (
            <div
              className={`mb-6 p-4 rounded-full ${
                formData.alertType === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {formData.alertMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
              
            {/* Member Information */}
              <label className="block text-xl font-semibold mb-2 text-black">Member Details</label>
              <div className="flex items-center bg-white border-2 rounded-full mb-3">
                <FaUser className="text-black ml-3 text-xl" />
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  className="w-full text-black px-4 py-3 border-0 rounded-full focus:outline-none"
                  placeholder="Enter your team name"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.6rem]">
                {/* Name */}
                <div className="flex items-center bg-white border-2 rounded-full">
                  <FaUser className="text-black ml-3 text-xl" />
                  <input
                    type="text"
                    name="name"
                    value={formData.member.name}
                    onChange={handleChange}
                    className="w-full text-black px-4 py-3 border-0 rounded-full focus:outline-none"
                    placeholder="Full Name"
                    required
                  />
                </div>
                {/* Email */}
                <div className="flex items-center bg-white border-2 rounded-full">
                  <FaEnvelope className="text-black ml-3 text-xl" />
                  <input
                    type="email"
                    name="email"
                    value={formData.member.email}
                    onChange={handleChange}
                    className="w-full text-black px-4 py-3 border-0 rounded-full focus:outline-none"
                    placeholder="Email"
                    required
                  />
                </div>
                {/* Phone */}
                <div className="flex items-center bg-white border-2 rounded-full">
                  <FaPhone className="text-black ml-3 text-xl" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.member.phone}
                    onChange={handleChange}
                    className="w-full text-black px-4 py-3 border-0 rounded-full focus:outline-none"
                    placeholder="Phone Number"
                    required
                  />
                </div>
                {/* College Name */}
                <div className="flex items-center bg-white border-2 rounded-full">
                  <FaUniversity className="text-black ml-3 text-xl" />
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.member.collegeName}
                    onChange={handleChange}
                    className="w-full text-black px-4 py-3 border-0 rounded-full focus:outline-none"
                    placeholder="College Name"
                    required
                  />
                </div>
                {/* GitHub */}
                <div className="flex items-center bg-white border-2 rounded-full h-[3.2rem]">
                  <FaGithub className="text-black ml-3 text-xl" />
                  <input
                    type="url"
                    name="github"
                    value={formData.member.github}
                    onChange={handleChange}
                    className="w-full text-black px-4 py-3 border-0 rounded-full focus:outline-none"
                    placeholder="GitHub Profile"
                  />
                </div>
                {/* LinkedIn */}
                <div className="flex items-center bg-white border-2 rounded-full h-[3.2rem]">
                  <FaLinkedin className="text-black ml-3 text-xl" />
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.member.linkedin}
                    onChange={handleChange}
                    className="w-full text-black px-4 py-3 border-0 rounded-full focus:outline-none"
                    placeholder="LinkedIn Profile"
                  />
                </div>
                {/* Upload Photo */}
                <div className="relative">
                  {/* Loader Overlay */}
                  {isLoading1 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-3xl z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                  )}

                  {/* File Upload Drop Zone */}
                  <FileDropZone
                    onDrop={handlePhotoDrop}
                    acceptedFormats="image/*"
                    label="Upload Photo (JPG, PNG)"
                    icon={FaImage}
                  />
                </div>
                {/* Resume Upload Zone */}
                <div className="relative">
                  {/* Loader Overlay */}
                  {isLoading2 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-3xl z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                  )}

                  {/* File Upload Drop Zone */}
                  <FileDropZone
                    onDrop={handleResumeDrop}
                    acceptedFormats=".pdf,.doc,.docx"
                    label="Upload Resume (PDF)"
                    icon={FaFileAlt}
                  />
                </div>

              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-full hover:bg-indigo-700 transition-all duration-300"
                >
                Submit Registration
                </button>
              </div>            
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;