function Welcome({ name }) {
  return (
    <div style={styles.container}>
      <h2 style={styles.greeting}>Bonjour {name}</h2>
      <p style={styles.message}>
        Today is a good day to be kind to yourself 🌱
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
  }
};
