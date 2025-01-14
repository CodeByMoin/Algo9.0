import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); 

  const handleAuth = async () => {
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        navigate("/register", { state: { email } });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/dashboard");
      }
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>{isSignup ? "Sign Up" : "Log In"}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ margin: "5px", padding: "10px" }}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ margin: "5px", padding: "10px" }}
      />
      <br />
      <button onClick={handleAuth}>
        {isSignup ? "Sign Up" : "Log In"}
      </button>
      <br />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        {isSignup ? "Already have an account?" : "Don't have an account?"}
        <span
          style={{ cursor: "pointer", color: "blue" }}
          onClick={() => {
            setIsSignup(!isSignup);
            setError("");
          }}
        >
          {isSignup ? " Log In" : " Sign Up"}
        </span>
      </p>
    </div>
  );
}

export default LoginPage;
