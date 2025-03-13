import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Get user role from Flask API
      const response = await fetch(`http://127.0.0.1:5000/user/getUserRole/${user.uid}`);
      const data = await response.json();
      const userRole = data.role;
  
      navigate(userRole === "student" ? "/student-home" : "/teacher-home");
    } catch (error) {
      alert(error.message);
    }
  };
  

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      navigate(user.role === "student" ? "/student-home" : "/teacher-home");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;
