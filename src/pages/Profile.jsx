import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

function Profile() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    age: "",
    gender: "",
    tagline: "",
    avatar_url: "",
  });
  const wrapperRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target) && !editing) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editing]);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) setProfile(data);
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...profile })
      .select()
      .single();
    if (!error) { setProfile(data); setEditing(false); setOpen(false); }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const { data: { user } } = await supabase.auth.getUser();
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { console.error(uploadError); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setProfile((prev) => ({ ...prev, avatar_url: data.publicUrl + `?t=${Date.now()}` }));
  }

  const initials = profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "?";

  return (
    <div className="profile-wrapper" ref={wrapperRef}>
      <button className="profile-avatar-btn" onClick={() => setOpen(!open)} aria-label="Profile">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" className="navbar-avatar" />
        ) : (
          <div
            className="navbar-avatar"
            style={{
              background: "linear-gradient(135deg, #5b9fd6, #3d7db3)",
              color: "#fff",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              userSelect: "none",
            }}
          >
            {initials}
          </div>
        )}
      </button>

      {open && (
        <div className="profile-dropdown">
          {editing ? (
            <>
              <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Profile photo</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: 13 }} />
              <input
                placeholder="Name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
              <input
                placeholder="Age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              />
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              >
                <option value="">Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
              <input
                placeholder="Tagline"
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setEditing(false); fetchProfile(); }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="profile-name">{profile.full_name || "Anonymous"}</p>
              {profile.tagline && <p className="profile-tagline">{profile.tagline}</p>}
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} style={{ width: "100%" }}>
                Edit Profile
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
