
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// Define the type for our request body
interface UserData {
  username: string;
  password: string;
  email: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { users } = await req.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request. Expected an array of users." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing ${users.length} users`);

    // Insert users with the admin service role (bypassing RLS)
    const { data, error } = await supabase
      .from("users")
      .upsert(
        users.map((user: UserData) => ({
          username: user.username,
          password: user.password,
          email: user.email
        })),
        { onConflict: "email" }
      );

    if (error) {
      console.error("Error inserting users:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully uploaded ${users.length} user records` 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "An unexpected error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
