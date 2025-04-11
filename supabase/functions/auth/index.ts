
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.0/mod.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }
  
  try {
    console.log("Auth function called");
    const { action, password, hashedPassword, email, sessionId } = await req.json()
    
    if (action === "hash") {
      // Hash the password
      console.log("Hashing password");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log("Password hashed successfully");
      return new Response(
        JSON.stringify({ hashedPassword }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    } 
    else if (action === "verify") {
      // Verify the password
      console.log("Verifying password");
      const isValid = await bcrypt.compare(password, hashedPassword);
      console.log("Password verification result:", isValid);
      return new Response(
        JSON.stringify({ isValid }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    } 
    else if (action === "createSession") {
      // Create a new session
      console.log("Creating session for:", email);
      const sessionId = crypto.randomUUID(); // Generate unique session ID
      const timestamp = new Date().toISOString();
      
      return new Response(
        JSON.stringify({ 
          sessionId, 
          timestamp,
          message: "Session created successfully" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    else if (action === "validateSession") {
      // Validate an existing session
      console.log("Validating session:", sessionId);
      
      // For now, just return valid - in a real implementation, 
      // you would check this against a database of valid sessions
      return new Response(
        JSON.stringify({ 
          valid: true,
          message: "Session is valid" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    else {
      console.log("Invalid action:", action);
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'hash', 'verify', 'createSession', or 'validateSession'." }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }
  } catch (error) {
    console.error("Auth function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})
