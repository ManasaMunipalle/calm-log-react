import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import Journal from "./Journal";
import MyEntries from "./MyEntries";
import MoodHeatmap from "../components/MoodHeatmap";
import AISummary from "./AISummary";
import ProfileSetup from "./ProfileSetup";

function Dashboard({ session }) {
  const [page, setPage] = useState("journal");
  const [profile, setProfile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

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
          .insert({ id: user.id, full_name: "", age: null, gender: "", tagline: "" })
          .select()
          .single();
        if (!error) setProfile(newProfile);
      } else {
        setProfile(data);
      }
    }
    loadProfile();
  }, [user]);

  if (!profile) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading your calm space...</p>
      </div>
    );
  }

  if (!profile.full_name) {
    return <ProfileSetup user={user} profile={profile} setProfile={setProfile} />;
  }

  return (
    <div>
      <Navbar setPage={setPage} activePage={page} />
      <main className="main-content">
        {page === "journal" && (
          <Journal
            user={user}
            selectedDate={selectedDate}
            clearSelectedDate={() => setSelectedDate(null)}
          />
        )}
        {page === "entries" && (
          <MyEntries
            user={user}
            setPage={setPage}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}
        {page === "heatmap" && <MoodHeatmap user={user} />}
        {page === "progress" && <AISummary user={user} />}
      </main>
    </div>
  );
}

export default Dashboard;
