import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../auth.css";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) alert(error.message);
    else alert("Check your email if confirmation is enabled 🌿");
  }

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) alert(error.message);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Mon Calme 🌿</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="button-group">
          <button className="primary-btn" onClick={handleLogin}>
            Login
          </button>

          <button className="secondary-btn" onClick={handleSignup}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;