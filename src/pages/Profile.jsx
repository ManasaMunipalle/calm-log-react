import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import "../profile.css";

function Profile() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    age: "",
    gender: "",
    tagline: "",
    avatar_url: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) setProfile(data);
  }


  async function handleSave() {
    const {data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    alert("User not authenticated");
    return;
  }

  console.log("Saving profile for user:", user.id);
  console.log("Profile data:", profile);

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: profile.full_name,
      age: profile.age,
      gender: profile.gender,
      tagline: profile.tagline,
      avatar_url: profile.avatar_url,
    })
    .select();   // 👈 IMPORTANT

  if (error) {
    console.error("Save error:", error);
    alert(error.message);
    return;
  }

  console.log("Saved successfully:", data);

  setEditing(false);
  setOpen(false);
}

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

  const fileExt = file.name.split(".").pop();   // 👈 get real extension
  const filePath = `${user.id}.${fileExt}`;     // 👈 match extension

   const {error: uploadError} = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

      if (uploadError) {
    console.error("Upload error:", uploadError);
    alert(uploadError.message);
    return;
  }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);


setProfile((prev) => ({
    ...prev,
    avatar_url: data.publicUrl + `?t=${Date.now()}`
  }));
}
    
const wrapperRef = useRef(null);
useEffect(() => {
  function handleClickOutside(event) {
    if (wrapperRef.current && 
      !wrapperRef.current.contains(event.target) &&
      !editing) {
      setOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [editing]);
  return (
    <div className="profile-wrapper" ref = {wrapperRef}>
      <img
        src={profile.avatar_url || "https://via.placeholder.com/45"}
        alt="avatar"
        className="profile-avatar"
        onClick={() => setOpen(!open)}
      />

      {open && (
        <div className="profile-dropdown">
          {editing ? (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />

              <input
                placeholder="Name"
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
              />

              <input
                placeholder="Age"
                value={profile.age}
                onChange={(e) =>
                  setProfile({ ...profile, age: e.target.value })
                }
              />

              <select
                value={profile.gender}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
              >
                <option value="">Select Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>

              <input
                placeholder="Tagline"
                value={profile.tagline}
                onChange={(e) =>
                  setProfile({ ...profile, tagline: e.target.value })
                }
              />

              <button type="button" onClick={handleSave}>Save</button>
            </>
          ) : (
            <>
              <h4>{profile.full_name}</h4>
              <p>{profile.tagline}</p>
              <button onClick={() => setEditing(true)}>Edit</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;