import { useState } from "react";

function Home() {
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
function handleLogin(e) {
  e.preventDefault();

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

  console.log("User profile created:", userProfile);
}

  


  return (
    <div style={styles.container}>
        <h1 style={styles.logo}>Mon Calme</h1>
        <p style={styles.tagline}>Écris. Respire. Avance.</p>

      <div style={styles.card}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          style={styles.input}
        />

        <select
          name="sex"
          value={form.sex}
          onChange={handleChange}
          style={styles.input}
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
          style={styles.input}
        />

        
        <button
            type="button"
            onClick={handleLogin}
            style={styles.button}
>
  Login
</button>

      </div>
    </div>
  );
}

export default Home;

const styles = {
  container: {
  backgroundColor: "#cfe8f6",
  minHeight: "100vh",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center"
},


  logo: {
    color: "white",
    fontStyle: "italic",
    fontSize: "3rem",
    marginBottom: "2rem"
  },

  card: {
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "90%",
    maxWidth:"400px"
  },

  input: {
  padding: "0.75rem",
  fontStyle: "italic",
  color: "black",
  fontSize: "1rem"
},


  button: {
    padding: "0.6rem",
    backgroundColor: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  
};
