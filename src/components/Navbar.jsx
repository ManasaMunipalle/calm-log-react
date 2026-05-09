import { supabase } from "../supabaseClient";
import Profile from "../pages/Profile";

function Navbar({ setPage, activePage }) {
  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const tabs = [
    { id: "journal", label: "✏️ Journal" },
    { id: "entries", label: "📖 Entries" },
    { id: "heatmap", label: "📅 Heatmap" },
    { id: "progress", label: "✨ Progress" },
  ];

  return (
    <>
      <header className="navbar">
        <div className="navbar-brand">
          <span className="navbar-logo">🌿</span>
          <span className="navbar-title">Calm Log</span>
        </div>
        <div className="navbar-right">
          <Profile />
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activePage === tab.id ? "active" : ""}`}
            onClick={() => setPage(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  );
}

export default Navbar;
