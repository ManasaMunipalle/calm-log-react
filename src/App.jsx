import { useEffect, useState } from "react";
import Home from "./components/home";
import Welcome from "./components/Welcome";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userProfile");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <Home />;
  }

  return <Welcome name={user.name} />;
}

export default App;
