const PUBLIC_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzY2RsZ2Fvc2V3bXBibHlzcWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDYwODI1ODQsImV4cCI6MTk2MTY1ODU4NH0.VdsXGKDJ2UzdJAbrOfqrp_BEH7CFv7sSSPKIIC0rzfk";
const URL = "https://iscdlgaosewmpblysqlz.supabase.co";

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
