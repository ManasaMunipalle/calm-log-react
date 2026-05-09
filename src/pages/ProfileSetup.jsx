import { useState } from "react";
import { supabase } from "../supabaseClient";

function ProfileSetup({ user, profile, setProfile }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    age: profile?.age || "",
    gender: profile?.gender || "",
    tagline: profile?.tagline || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    if (!form.full_name.trim()) {
      setError("Please enter your name to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name, age: form.age, gender: form.gender, tagline: form.tagline })
      .eq("id", user.id);
    if (error) setError(error.message);
    else setProfile({ ...profile, ...form });
    setLoading(false);
  }

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <div style={{ fontSize: 36, marginBottom: 8 }}>🌿</div>
        <h2>Welcome to Calm Log</h2>
        <p>Tell us a little about yourself to get started.</p>

        <div className="form-group">
          <label>Your Name *</label>
          <input name="full_name" placeholder="e.g. Manasa" value={form.full_name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Age</label>
          <input name="age" type="number" placeholder="e.g. 28" value={form.age} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Personal tagline</label>
          <input name="tagline" placeholder="e.g. Finding calm one day at a time" value={form.tagline} onChange={handleChange} />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button className="btn btn-primary btn-full" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Let's Begin 🌱"}
        </button>
      </div>
    </div>
  );
}

export default ProfileSetup;
