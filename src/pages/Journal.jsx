import { useState } from "react";
import { supabase } from "../supabaseClient";

const MOODS = [
  { label: "Very Sad", emoji: "😢", score: 1 },
  { label: "Sad", emoji: "🙁", score: 2 },
  { label: "Neutral", emoji: "😐", score: 3 },
  { label: "Happy", emoji: "🙂", score: 4 },
  { label: "Very Happy", emoji: "😄", score: 5 },
];

const PROMPTS = [
  { key: "feeling", label: "How I feel today", placeholder: "What's on your mind? How are you feeling right now?" },
  { key: "heavy", label: "What felt heavy", placeholder: "One thing that weighed on you today..." },
  { key: "okay", label: "What felt okay", placeholder: "One thing that felt good, even a little..." },
  { key: "tasks", label: "Notes & tomorrow", placeholder: "Things I did today, or want to do tomorrow..." },
];

function Journal({ user, selectedDate, clearSelectedDate }) {
  const [fields, setFields] = useState({ feeling: "", heavy: "", okay: "", tasks: "" });
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const dateLabel = selectedDate
    ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });

  function handleField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!selectedMood) {
      setStatus({ type: "error", text: "Please select a mood before saving." });
      return;
    }

    setLoading(true);
    setStatus(null);

    const entryDate = selectedDate ? new Date(selectedDate + "T12:00:00") : new Date();

    const { error } = await supabase.from("journals").insert([{
      user_id: user.id,
      content: fields.feeling,
      mood_score: selectedMood.score,
      mood_label: selectedMood.label,
      created_at: entryDate.toISOString(),
      feeling: fields.feeling,
      heavy: fields.heavy,
      okay: fields.okay,
      tasks: fields.tasks,
    }]);

    if (error) {
      setStatus({ type: "error", text: error.message });
    } else {
      setStatus({ type: "success", text: "Saved gently 🌱" });
      setFields({ feeling: "", heavy: "", okay: "", tasks: "" });
      setSelectedMood(null);
      clearSelectedDate();
    }
    setLoading(false);
  }

  function handleClear() {
    setFields({ feeling: "", heavy: "", okay: "", tasks: "" });
    setSelectedMood(null);
    setStatus({ type: "info", text: "Cleared ✨ Ready for a fresh entry." });
  }

  return (
    <div className="journal-page">
      <div className="page-header">
        <h2>🌿 Daily Reflection</h2>
        <p className="date-label">{dateLabel}</p>
        {selectedDate && <span className="badge">Writing for a past date</span>}
      </div>

      {/* Mood picker */}
      <div className="mood-section">
        <p className="section-label">How are you feeling?</p>
        <div className="mood-options">
          {MOODS.map((mood) => (
            <button
              key={mood.score}
              className={`mood-btn ${selectedMood?.score === mood.score ? "selected" : ""}`}
              onClick={() => setSelectedMood(mood)}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Journal prompts */}
      <div className="prompts-section">
        {PROMPTS.map(({ key, label, placeholder }) => (
          <div key={key} className="prompt-card">
            <p className="prompt-label">{label}</p>
            <textarea
              className="prompt-textarea"
              placeholder={placeholder}
              value={fields[key]}
              onChange={(e) => handleField(key, e.target.value)}
              rows={3}
            />
          </div>
        ))}
      </div>

      {status && <div className={`alert alert-${status.type}`}>{status.text}</div>}

      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Entry"}
        </button>
        <button className="btn btn-ghost" onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
}

export default Journal;
