import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { auth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import bg from './assets/bg.png';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    if (isSignup && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const checkIfUserExistsInTeams = async (email) => {
    try {
      const db = getFirestore();
      const teamsRef = collection(db, "teams");
      const querySnapshot = await getDocs(teamsRef);
      
      for (const doc of querySnapshot.docs) {
        const members = doc.data().members || [];
        const memberExists = members.some(member => member.email === email);
        if (memberExists) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking team membership:", error);
      throw error;
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      const existsInTeam = await checkIfUserExistsInTeams(user.email);
      
      if (existsInTeam) {
        console.log("User found in teams, redirecting to dashboard");
        navigate("/dashboard");
      } else {
        console.log("User not found in any team, redirecting to registration");
        navigate("/register", { state: { email: user.email } });
      }
    } catch (error) {
      console.error("Google login error:", error);
      setErrorMessage("Something went wrong with Google login");
    }
  };

  const handleGithubLogin = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      const existsInTeam = await checkIfUserExistsInTeams(user.email);
      
      if (existsInTeam) {
        console.log("User found in teams, redirecting to dashboard");
        navigate("/dashboard");
      } else {
        console.log("User not found in any team, redirecting to registration");
        navigate("/register", { state: { email: user.email } });
      }
    } catch (error) {
      console.error("GitHub login error:", error);
      setErrorMessage("Something went wrong with GitHub login");
    }
  };


  const handleForgotPassword = async () => {
    const email = formData.email; 
    if (!email) {
      alert("Please enter your email address to reset your password.");
      return;
    }
  
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert("Failed to send password reset email. Please try again.");
    }
  };


  const handleAuth = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        navigate("/register", { state: { email: formData.email } });
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        navigate("/dashboard");
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };


  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div className="relative h-screen flex w-full bg-white rounded-3xl overflow-hidden">
        {/* Image Section */}
        <div
          className={`absolute top-0 left-0 h-full w-full md:w-1/2 transition-transform duration-500 ease-in-out ${
            isSignup ? "translate-x-0" : "translate-x-full"
          } z-20 hidden md:block  justify-center items-center rounded-3xl bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-20 border-4 border-gray-100`} 
        >
          <img
            src={bg}
            alt="Illustration"
            className="w-full h-full max-w-full max-h-full object-cover rounded-3xl bg-slate-800" 
          />
        </div>

        {/* Login Form */}

        <div
          className={`relative flex w-full justify-center md:w-1/2 flex-col p-8 transition-transform duration-500 ease-in-out ${
            isSignup ? "hidden md:flex" : "flex"
          }`}
        >
          <h2 className="md:text-4xl text-3xl font-bold text-gray-800 mb-8 text-center">Log In</h2>
          <form onSubmit={handleAuth} className="space-y-6">

            {/* Google Login Button */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-0 lg:px-12">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex-1 text-black border border-gray-300 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="w-[3.25rem] h-9 " viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                Log in with Google
              </button>
              <button
                type="button"
                onClick={handleGithubLogin}
                className="flex-1 text-black border border-gray-300 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="w-[3.25rem] h-9" viewBox="0 0 30 30">
                <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
                </svg>
                Log in with GitHub
              </button>
            </div>

              {/* OR Separator */}
              
            <div className="flex items-center justify-center my-6 px-0 lg:px-12">
              <hr className="w-full border-gray-300" />
                <span className="absolute text-gray-500 bg-white px-4">OR</span>
            </div>

            <div className="px-0 lg:px-12">
              <label className="block text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="px-0 lg:px-12">
              <label className="block text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="text-right mt-2 px-0 lg:px-12">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-600 hover:underline focus:outline-none"
              >
              Forgot Password?
              </button>
            </div>

            <div className="px-0 lg:px-12">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
                transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
              Log In
              </button>
            </div>
              
          </form>

          {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => setIsSignup(true)}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* Signup Form */}

        <div
          className={`relative flex w-full justify-center md:w-1/2 flex-col p-8 transition-transform duration-500 ease-in-out ${
            isSignup ? "flex" : "hidden md:flex"
          } `}
        >
          <h2 className="md:text-4xl text-3xl font-bold text-gray-800 mb-8 text-center">Create an Account</h2>
          <form onSubmit={handleAuth} className="space-y-6">

            {/* Google Login Button */}
    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-0 lg:px-12">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex-1 text-black border border-gray-300 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="w-[3.25rem] h-9 " viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                Sign up with Google
              </button>
              <button
                type="button"
                onClick={handleGithubLogin}
                className="flex-1 text-black border border-gray-300 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="w-[3.25rem] h-9" viewBox="0 0 30 30">
                  <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
                </svg>
                Sign up with GitHub
              </button>
            </div>

            {/* OR Separator */}
    
            <div className="flex items-center justify-center my-6 px-0 lg:px-12">
              <hr className="w-full border-gray-300" />
              <span className="absolute text-gray-500 bg-white px-4">OR</span>
            </div>

            <div className="px-0 lg:px-12">
              <label className="block text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your email"
                />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="px-0 lg:px-12">
              <label className="block text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword1 ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your password"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword1(!showPassword1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                  {showPassword1 ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="px-0 lg:px-12">
              <label className="block text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword2 ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="px-0 lg:px-12">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-12 rounded-lg hover:bg-blue-700 
                transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign Up
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => setIsSignup(false)}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Log In
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
