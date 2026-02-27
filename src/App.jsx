import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
          console.log("Auth state changed:", session);

        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    return <Auth />;
  }

  return <Dashboard session={session} />;
}

export default App;
