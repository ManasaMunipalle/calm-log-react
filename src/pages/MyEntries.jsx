import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function MyEntries({ user }) {
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [streak, setStreak] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [entryDates, setEntryDates] = useState([]);
  const calendarRef = useRef(null);
  useEffect(() => {
  if (!user) return;

  async function loadEntries() {
    let query = supabase
      .from("journals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // If a calendar date is selected → filter
    if (selectedDate) {
      const start = new Date(selectedDate);
      const end = new Date(selectedDate);
      end.setDate(end.getDate() + 1);

      query = query
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString());
    }

    const { data, error } = await query;

    if (!error && data) {
      setEntries(data);

      // Only calculate streak when NOT filtering
      if (!selectedDate) {
        calculateStreak(data);

        const dates = [
          ...new Set(
            data.map((entry) =>
              new Date(entry.created_at)
                .toISOString()
                .split("T")[0]
            )
          ),
        ];

        setEntryDates(dates);
      }
    }
  }

  loadEntries();
}, [user, selectedDate]);
useEffect(() => {
  function handleClickOutside(e) {
    if (calendarRef.current && !calendarRef.current.contains(e.target)) {
      setShowCalendar(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  // 🗑 DELETE
async function handleDelete(id) {
  const confirmDelete = window.confirm("Delete this entry?");
  if (!confirmDelete) return;

  const { error } = await supabase
    .from("journals")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  // Instead of fetchEntries(), just update state
  setEntries((prev) => prev.filter((entry) => entry.id !== id));
}

  // ✏️ START EDIT
  function handleEdit(entry) {
    setEditingId(entry.id);
    setEditedContent(entry.content);
  }

  // 💾 SAVE UPDATE
  async function handleUpdate(id) {
    const { error } = await supabase
      .from("journals")
      .update({ content: editedContent })
      .eq("id", id);

    if (!error) {
      setEntries(
        entries.map((entry) =>
          entry.id === id ? { ...entry, content: editedContent } : entry
        )
      );

      setEditingId(null);
      setEditedContent("");
    }
  }
  function handleDateClick(date) {
  const selected = date.toISOString().split("T")[0];
  setSelectedDate(selected);
  setShowCalendar(false);
  }
  function calculateStreak(entries) {
  if (!entries.length) {
    setStreak(0);
    return;
  }
  
  // Extract unique dates
  const uniqueDates = [
    ...new Set(
      entries.map((entry) =>
        new Date(entry.created_at).toISOString().split("T")[0]
      )
    ),
  ];

  let currentStreak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < uniqueDates.length; i++) {
    const entryDate = new Date(uniqueDates[i]);
    entryDate.setHours(0, 0, 0, 0);

    const diffInDays =
      (today - entryDate) / (1000 * 60 * 60 * 24);

    if (diffInDays === currentStreak) {
      currentStreak++;
    } else if (diffInDays > currentStreak) {
      break;
    }
  }

  setStreak(currentStreak);
}

  return (
    <div style={{ padding: 20 }}>
      <h2>My Entries</h2>
      <h3>
  🔥 Current Streak: {streak} Day{streak !== 1 && "s"}
</h3>
<div style={{ display: "flex", justifyContent: "flex-end" }}>
  <div style={{ position: "relative" }} ref = {calendarRef}>
    <button onClick={() => setShowCalendar(!showCalendar)}>
      ⋯
    </button>

    {showCalendar && (
      <div
        style={{
          position: "absolute",
          right: 0,
          background: "white",
          padding: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          borderRadius: 10,
          zIndex: 100,
        }}
      >
        <Calendar
          onClickDay={handleDateClick}
          tileClassName={({ date }) => {
            const formatted = date.toISOString().split("T")[0];
            return entryDates.includes(formatted)
              ? "highlight-date"
              : null;
          }}
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            style={{
              marginTop: 10,
              width: "100%"
            }}
          >
            Clear Filter
          </button>
        )}
      </div>

    )}
  </div>
</div>
{entries.length === 0 ? (
  <div style={{ marginTop: 30, textAlign: "center", opacity: 0.7 }}>
    {selectedDate ? (
      <>
        <p style={{ fontSize: 18 }}>
          📭 No entries found for{" "}
          <strong>
            {new Date(selectedDate).toLocaleDateString()}
          </strong>
        </p>
        <button
          onClick={() => setSelectedDate(null)}
          style={{ marginTop: 10 }}
        >
          Clear Filter
        </button>
      </>
    ) : (
      <p style={{ fontSize: 18 }}>
        ✍️ You haven't written any entries yet.
      </p>
    )}
  </div>
) : (
  entries.map((entry) => (
    <div
      key={entry.id}
      style={{
        borderBottom: "1px solid #ddd",
        padding: "15px 0",
      }}
    >
      <h4>
        {new Date(entry.created_at).toLocaleDateString()}
      </h4>

      <p><strong>Mood:</strong> {entry.mood_label}</p>

      {editingId === entry.id ? (
        <>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            style={{ width: "100%", minHeight: "80px" }}
          />
          <button onClick={() => handleUpdate(entry.id)}>Save</button>
          <button onClick={() => setEditingId(null)}>Cancel</button>
        </>
      ) : (
        <>
          <p>{entry.content}</p>
          <button onClick={() => handleEdit(entry)}>Edit</button>
          <button onClick={() => handleDelete(entry.id)}>Delete</button>
        </>
      )}
    </div>
  ))
)}
    
        </div>
      )
}

export default MyEntries;