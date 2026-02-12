function Welcome({ name, setPage }) {
  return (
    <div style={styles.container}>
      
      {/* Profile Icon */}
      <div style={styles.topBar}>
        <span
          style={styles.profileIcon}
          onClick={() => setPage("profile")}
        >
          👤
        </span>
      </div>

      <h2 style={styles.greeting}>Bonjour {name}</h2>

      <p style={styles.message}>
        Today is a beautiful day to grow gently 🌿
      </p>
    </div>
  );
}


export default Welcome;

const styles = {
  container: {
    padding: "2rem",
    textAlign: "center"
  },

  greeting: {
    fontStyle: "italic",
    fontWeight: "bold",
    color: "black",
    fontSize: "1.8rem",
    marginBottom: "1rem"
  },

  message: {
    fontSize: "1.1rem",
    color: "#333"
  },
  topBar: {
  display: "flex",
  justifyContent: "flex-end"
},

profileIcon: {
  cursor: "pointer",
  fontSize: "1.5rem"
},

};
