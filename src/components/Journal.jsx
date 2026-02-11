// src/components/Journal.jsx
import { useState } from "react";

function Journal() {
  const [entry, setEntry] = useState("");

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Calm Log</h2>

      <textarea
        placeholder="How are you feeling today?"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        rows={5}
        style={{ width: "100%" }}
      />

      <p>{entry}</p>
    </div>
  );
}

export default Journal;
