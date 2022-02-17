const PUBLIC_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtZ25wb3h6bm91eGx0ZGNkY3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxMjA0MTUsImV4cCI6MTk2MDY5NjQxNX0.9xG_n9LSqtT8Y1KSOrcjBiuDMWWPKzGACl5QJNw2im0";
const URL = "https://xmgnpoxznouxltdcdcxe.supabase.co";

const { createClient } = supabase;
const _supabase = createClient(URL, PUBLIC_KEY);

// console.log("Supabase Instance: ", _supabase);

window._supabase = _supabase;

const addToLeaderboard = async (score, time, name = "Guest") => {
    const { data, error } = await _supabase.from("leaderboard").insert([
        {
            created_at: new Date(),
            name,
            score,
            time,
        },
    ]);

    // console.log(data, error);
};

const getLeaderboard = async () => {
    const { data, error } = await _supabase
        .from("leaderboard")
        .select()
        .order("score", { ascending: false })
        .limit(50);

    // console.log(data, error);

    if (error) {
        alert("Error: " + error.message);
        throw error;
    }

    return data;
};

export { addToLeaderboard, getLeaderboard };
