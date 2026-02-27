import { supabase } from "../supabaseClient";
import Profile from "../pages/Profile"; // make sure this is imported

function Navbar({ setPage }) {
  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
      }}
    >
      {/* LEFT SIDE */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setPage("journal")}>Journal</button>
        <button onClick={() => setPage("entries")}>My Entries</button>
      </div>

      {/* RIGHT SIDE */}
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        <Profile />
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;