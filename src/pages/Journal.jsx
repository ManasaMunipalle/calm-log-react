import { useState, useRef } from "react";
import { supabase } from "../supabaseClient";

function Journal({ user }) {
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const textareaRef = useRef(null);

  const moods = [
    { label: "Very Sad", emoji: "😢", score: 1 },
    { label: "Sad", emoji: "🙁", score: 2 },
    { label: "Neutral", emoji: "😐", score: 3 },
    { label: "Happy", emoji: "🙂", score: 4 },
    { label: "Very Happy", emoji: "😄", score: 5 },
  ];

  const handleChange = (e) => {
    setContent(e.target.value);

    // Auto resize
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      textareaRef.current.scrollHeight + "px";
  };

  async function handleSave() {
    const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    alert("User not authenticated");
    return;
  }

  if (!selectedMood) {
    alert("Please select a mood");
    return;
  }

  const { error } = await supabase.from("journals").insert([
    {
      user_id: user.id,
      content: content,
      mood_score: selectedMood.score,
      mood_label: selectedMood.label,
    },
  ]);

  if (error) {
    console.error("Insert error:", error);
    alert(error.message);
  } else {
    alert("Saved 🌿");
    setContent("");
    setSelectedMood(null);
  }
}
    
  return (
    <div style={{ padding: 20 }}>
      <h2>Daily Journal</h2>

      {/* Mood Selector */}
      <div style={{ marginBottom: 20 }}>
        {moods.map((mood) => (
          <span
            key={mood.score}
            style={{
              fontSize: 28,
              marginRight: 15,
              cursor: "pointer",
              opacity: selectedMood?.score === mood.score ? 1 : 0.5,
            }}
            onClick={() => setSelectedMood(mood)}
          >
            {mood.emoji}
          </span>
        ))}
      </div>

      {/* Expanding Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        placeholder="How are you feeling today?"
        rows={1}
        style={{
          width: "100%",
          resize: "none",
          overflow: "hidden",
          border: "none",
          outline: "none",
          fontSize: 18,
          lineHeight: 1.6,
        }}
      />

      <br />
      <br />

      <button onClick={handleSave}>Save</button>
    </div>
  );
}
export default Journal;