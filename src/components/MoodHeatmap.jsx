import { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { supabase } from "../supabaseClient";

const MOOD_SCORE = { "Very Sad": 1, "Sad": 2, "Neutral": 3, "Happy": 4, "Very Happy": 5 };
const MOOD_LABELS = ["", "Very Sad", "Sad", "Neutral", "Happy", "Very Happy"];

function MoodHeatmap({ user }) {
  const [values, setValues] = useState([]);
  const [stats, setStats] = useState({ total: 0, streak: 0, avgMood: 0 });

  useEffect(() => {
    if (!user) return;
    fetchEntries();
  }, [user]);

  async function fetchEntries() {
    const { data, error } = await supabase
      .from("journals")
      .select("created_at, mood_score, mood_label")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) { console.error(error); return; }

    const heatmapValues = data.map((entry) => ({
      date: new Date(entry.created_at).toLocaleDateString("en-CA"),
      count: entry.mood_score || (MOOD_SCORE[entry.mood_label] ?? 3),
    }));
    setValues(heatmapValues);

    const total = data.length;
    const scored = data.filter((e) => e.mood_score || e.mood_label);
    const avgMood = scored.length
      ? scored.reduce((sum, e) => sum + (e.mood_score || MOOD_SCORE[e.mood_label] || 3), 0) / scored.length
      : 0;

    // streak
    const uniqueDates = [...new Set(
      data.map((e) => new Date(e.created_at).toLocaleDateString("en-CA"))
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

    setStats({ total, streak, avgMood: Math.round(avgMood * 10) / 10 });
  }

  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const moodEmoji =
    stats.avgMood >= 4.5 ? "😄" :
    stats.avgMood >= 3.5 ? "🙂" :
    stats.avgMood >= 2.5 ? "😐" :
    stats.avgMood >= 1.5 ? "🙁" : "😢";

  return (
    <div className="heatmap-page">
      <div className="page-header">
        <h2>📅 Your Journey</h2>
        <p className="date-label">A full year of your reflection practice</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.streak > 0 ? `${stats.streak} 🔥` : "0"}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.avgMood > 0 ? moodEmoji : "—"}</div>
          <div className="stat-label">Avg Mood {stats.avgMood > 0 ? `(${stats.avgMood}/5)` : ""}</div>
        </div>
      </div>

      <div className="heatmap-container">
        <CalendarHeatmap
          startDate={startDate}
          endDate={new Date()}
          values={values}
          classForValue={(value) => (!value ? "color-empty" : `color-mood-${value.count}`)}
          tooltipDataAttrs={(value) => {
            if (!value?.date) return {};
            return {
              "title": `${value.date} · ${MOOD_LABELS[value.count] || "Logged"}`,
            };
          }}
          showWeekdayLabels
        />
      </div>

      <div className="heatmap-legend">
        <span className="muted">Mood:</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`legend-cell color-mood-${n}`} title={MOOD_LABELS[n]} />
        ))}
        <span className="muted">1 → 5</span>
      </div>
    </div>
  );
}

export default MoodHeatmap;
