import { useEffect, useState } from "react";
import Home from "./components/home";
import Welcome from "./components/Welcome";
import Profile from "./components/Profile";

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");

  useEffect(() => {
    const storedUser = localStorage.getItem("userProfile");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setPage("welcome");
    }
  }, []);

  if (!user && page === "home") {
    return <Home setUser={setUser} setPage={setPage} />;
  }

  if (page === "welcome") {
    return <Welcome name={user?.name} setPage={setPage} />;
  }

  if (page === "profile") {
    return (
      <Profile
        user={user}
        setUser={setUser}
        setPage={setPage}
      />
    );
  }

  return null;
}

export default App;
