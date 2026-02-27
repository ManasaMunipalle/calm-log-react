import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://azsfsusvckvvagnmcwmc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c2ZzdXN2Y2t2dmFnbm1jd21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjgxNjgsImV4cCI6MjA4Njk0NDE2OH0.rM7t80CAVbNj_I3gyTlGZE017beSG1MbgLFV84-FLFY";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

window.supabase = supabase;
