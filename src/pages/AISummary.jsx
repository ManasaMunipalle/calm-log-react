import { useState } from "react";
import { supabase } from "../supabaseClient";

function AISummary({ user }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function generateSummary() {
    setLoading(true);
    setError(null);
    setSummary("");

    const { data: entries, error: fetchError } = await supabase
      .from("journals")
      .select("created_at, feeling, heavy, okay, tasks, content, mood_score, mood_label")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (fetchError || !entries?.length) {
      setError("No entries found. Write a few journal entries first to get your summary!");
      setLoading(false);
      return;
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-summary", {
        body: { entries },
      });

      if (fnError) throw new Error(fnError.message);
      setSummary(data.summary);
    } catch (err) {
      setError("Could not generate summary. Make sure the AI function is deployed and your Anthropic key is set.");
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <div className="ai-page">
      <div className="page-header">
        <h2>✨ My Progress</h2>
        <p className="date-label">Claude reflects on your recent entries</p>
      </div>

      <p className="ai-page page-desc">
        Claude will read your last 30 journal entries and reflect back your emotional patterns,
        what's weighing on you, what's going well, and offer gentle encouragement for your journey.
      </p>

      <button
        className="btn btn-primary btn-generate"
        onClick={generateSummary}
        disabled={loading}
      >
        {loading ? "✨ Reflecting on your journey..." : "✨ Generate My Summary"}
      </button>

      {error && <div className="alert alert-error">{error}</div>}

      {summary && (
        <div className="summary-card">
          <div className="summary-header">
            <span className="summary-icon">🌿</span>
            <h3>Your Reflection</h3>
          </div>
          <div className="summary-body">
            {summary.split("\n").filter((p) => p.trim()).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="summary-refresh">
            <button className="btn btn-ghost btn-sm" onClick={generateSummary} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>
      )}

      {!summary && !loading && !error && (
        <div className="empty-state">
          <p>💙 Press the button above to get a warm, personalized reflection on your journaling journey.</p>
        </div>
      )}
    </div>
  );
}

export default AISummary;
