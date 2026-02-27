import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../profile.css";

function ProfileSetup({ user, profile, setProfile }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    age: profile?.age || "",
    gender: profile?.gender || "",
    tagline: profile?.tagline || ""
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        age: form.age,
        gender: form.gender,
        tagline: form.tagline
      })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
    } else {
      setProfile({ ...profile, ...form });
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Complete Your Profile 🌿</h2>

        <input
          name="full_name"
          placeholder="Your Name"
          value={form.full_name}
          onChange={handleChange}
        />

        <input
          name="age"
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
        />

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
        >
          <option value="">Select Gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>

        <input
          name="tagline"
          placeholder="Your Tagline"
          value={form.tagline}
          onChange={handleChange}
        />

        <button onClick={handleSave}>Save Profile</button>
        <button onClick={handleSave}>Edit profile</button>

      </div>
    </div>
  );
}

export default ProfileSetup;