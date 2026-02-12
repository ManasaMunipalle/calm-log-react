import { useState } from "react";
import "../home.css";

function Home({ setUser, setPage }) {
  const [form, setForm] = useState({
    name: "",
    sex: "",
    age: ""
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function handleLogin() {
    if (!form.name || !form.sex || !form.age) {
      alert("Please enter your name, sex, and age 🌿");
      return;
    }

    const userProfile = {
      name: form.name,
      sex: form.sex,
      age: form.age,
      tagline: "",
      theme: "calm",
      lastJournalDate: null,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    setUser(userProfile);
    setPage("welcome");
  }

  return (
    <div className="container">
      <h1 className="logo">Mon Calme</h1>
      <p className="tagline">Écris. Respire. Avance.</p>

      <div className="card">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="input"
        />

        <select
          name="sex"
          value={form.sex}
          onChange={handleChange}
          className="input"
        >
          <option value="">Sex</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>

        <input
          name="age"
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          className="input"
        />

        <button
          type="button"
          onClick={handleLogin}
          className="button"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Home;
