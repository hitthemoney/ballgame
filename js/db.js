const PUBLIC_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzU4NTAzMywiZXhwIjoxOTU5MTYxMDMzfQ.1k98TGa8xrZpYqGwPImvnqtp9rH3rxXbgymp6Xczf5k";
const URL = "https://xyufqutkefhirssoinju.supabase.co";

const { createClient } = supabase;
const _supabase = createClient(URL, PUBLIC_KEY);

// console.log("Supabase Instance: ", _supabase);

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
