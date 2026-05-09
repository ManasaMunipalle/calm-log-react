import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const MOOD_EMOJIS = { "Very Sad": "😢", "Sad": "🙁", "Neutral": "😐", "Happy": "🙂", "Very Happy": "😄" };

function calculateStreak(entries) {
  if (!entries.length) return 0;

  const uniqueDates = [...new Set(
    entries.map((e) => new Date(e.created_at).toLocaleDateString("en-CA"))
  )].map((d) => new Date(d)).sort((a, b) => b - a);

  let today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasTodayEntry = uniqueDates.some((d) => d.toDateString() === today.toDateString());
  if (!hasTodayEntry) today.setDate(today.getDate() - 1);

  let streak = 0;
  for (const date of uniqueDates) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const diff = (today - d) / 86400000;
    if (diff === streak) streak++;
    else if (diff > streak) break;
  }
  return streak;
}

function MyEntries({ user, setPage, selectedDate, setSelectedDate }) {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [entryDates, setEntryDates] = useState({});
  const calendarRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    loadEntries();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadEntries() {
    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEntries(data);
      const moodMap = {};
      data.forEach((entry) => {
        const date = new Date(entry.created_at).toLocaleDateString("en-CA");
        moodMap[date] = entry.mood_label;
      });
      setEntryDates(moodMap);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    const { error } = await supabase.from("journals").delete().eq("id", id);
    if (!error) setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleUpdate(id) {
    const { error } = await supabase
      .from("journals")
      .update({ content: editedContent, feeling: editedContent })
      .eq("id", id);
    if (!error) {
      setEntries(entries.map((e) => e.id === id ? { ...e, content: editedContent, feeling: editedContent } : e));
      setEditingId(null);
    }
  }

  function handleDateClick(date) {
    setSelectedDate(date.toLocaleDateString("en-CA"));
    setShowCalendar(false);
  }

  const streak = calculateStreak(entries);

  const filtered = entries.filter((entry) => {
    const matchDate = !selectedDate ||
      new Date(entry.created_at).toLocaleDateString("en-CA") === selectedDate;
    const searchLower = search.toLowerCase();
    const matchSearch = !search ||
      [entry.content, entry.feeling, entry.heavy, entry.okay, entry.tasks, entry.mood_label]
        .some((f) => f?.toLowerCase().includes(searchLower));
    return matchDate && matchSearch;
  });

  return (
    <div className="entries-page">
      <div className="entries-header">
        <h2>📖 My Entries</h2>
        <span className="entries-count">{entries.length} total</span>
      </div>

      {streak > 0 && (
        <div className="streak-banner">
          🔥 {streak}-day streak — keep it up!
        </div>
      )}

      {/* Search & filter row */}
      <div className="search-row">
        <input
          className="search-input"
          type="text"
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ position: "relative" }} ref={calendarRef}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            📅 {selectedDate ? selectedDate : "Filter by date"}
          </button>
          {showCalendar && (
            <div style={{ position: "absolute", right: 0, zIndex: 100, marginTop: 6 }}>
              <Calendar
                onClickDay={handleDateClick}
                tileClassName={({ date }) => {
                  const d = date.toLocaleDateString("en-CA");
                  if (d === selectedDate) return "selected-date";
                  const mood = entryDates[d];
                  if (!mood) return null;
                  const score = { "Very Sad": 1, "Sad": 2, "Neutral": 3, "Happy": 4, "Very Happy": 5 }[mood];
                  return score ? `color-mood-${score}` : null;
                }}
              />
            </div>
          )}
        </div>

        {(selectedDate || search) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setSelectedDate(null); setSearch(""); }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Entry list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          {selectedDate ? (
            <>
              <p>🌿 No entry for {selectedDate}.</p>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 16 }}
                onClick={() => { setPage("journal"); }}
              >
                ✍️ Write an Entry
              </button>
            </>
          ) : (
            <p>✍️ No entries yet. Start with today's reflection!</p>
          )}
        </div>
      ) : (
        filtered.map((entry) => {
          const dateStr = new Date(entry.created_at).toLocaleDateString("en-US", {
            weekday: "short", year: "numeric", month: "short", day: "numeric",
          });
          const emoji = MOOD_EMOJIS[entry.mood_label] || "";
          const isEditing = editingId === entry.id;

          return (
            <div key={entry.id} className="entry-card">
              <div className="entry-card-header" onClick={() => !isEditing && setEditingId(isEditing ? null : entry.id === editingId ? null : null)}>
                <div className="entry-card-meta">
                  <span className="entry-date">{dateStr}</span>
                  {entry.mood_label && (
                    <span className="entry-mood-badge">{emoji} {entry.mood_label}</span>
                  )}
                </div>
                {!isEditing && entry.content && (
                  <span className="entry-preview">{(entry.feeling || entry.content || "").slice(0, 60)}</span>
                )}
              </div>

              <div className="entry-card-body">
                {isEditing ? (
                  <div style={{ paddingTop: 16 }}>
                    <textarea
                      className="entry-edit-textarea"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={4}
                    />
                    <div className="entry-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(entry.id)}>Save</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="entry-fields">
                    {[
                      { key: "feeling", label: "Feeling" },
                      { key: "heavy", label: "Heavy" },
                      { key: "okay", label: "Okay" },
                      { key: "tasks", label: "Notes" },
                    ].map(({ key, label }) =>
                      entry[key] ? (
                        <div key={key} className="entry-field">
                          <strong>{label}</strong>
                          <p>{entry[key]}</p>
                        </div>
                      ) : null
                    )}
                    {!entry.feeling && !entry.heavy && !entry.okay && !entry.tasks && entry.content && (
                      <div className="entry-field">
                        <strong>Entry</strong>
                        <p>{entry.content}</p>
                      </div>
                    )}
                    <div className="entry-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setEditingId(entry.id); setEditedContent(entry.feeling || entry.content || ""); }}
                      >
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(entry.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default MyEntries;
