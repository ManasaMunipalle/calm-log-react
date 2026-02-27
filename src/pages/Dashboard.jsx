import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import Journal from "./Journal";
import MyEntries from "./MyEntries";
import Profile from "./Profile";
import ProfileSetup from "./ProfileSetup"; // 🔥 IMPORTANT

function Dashboard({ session }) {
  const [page, setPage] = useState("journal");
  const [profile, setProfile] = useState(null);

  const user = session.user;

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!data) {
        const { data: newProfile, error } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            full_name: "",
            age: null,
            gender: "",
            tagline: ""
          })
          .select()
          .single();

        if (error) {
          console.error("Insert error", error);
          return;
        }

        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    }

    loadProfile();
  }, [user]);

  if (!profile) return <div>Loading...</div>;

  // 🔥 STEP 1: If profile incomplete → show ProfileSetup
  if (!profile.full_name) {
    return (
      <ProfileSetup
        user={user}
        profile={profile}
        setProfile={setProfile}
      />
    );
  }

  // 🔥 STEP 2: Normal dashboard after profile completed
  return (
    <>
      <Navbar setPage={setPage} />

      {page === "journal" && <Journal user={user} />}
      {page === "entries" && <MyEntries user={user} />}
      {page === "profile" && (
        <Profile
          user={user}
          profile={profile}
          setProfile={setProfile}
        />
      )}
    </>
  );
}

export default Dashboard;