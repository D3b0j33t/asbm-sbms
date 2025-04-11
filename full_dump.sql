

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."add_reset_columns"("admin_users" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
    -- Add reset_password_token column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND column_name = 'reset_password_token'
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN reset_password_token text', $1);
    END IF;

    -- Add reset_password_expires column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND column_name = 'reset_password_expires'
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN reset_password_expires timestamp with time zone', $1);
    END IF;
END;
$_$;


ALTER FUNCTION "public"."add_reset_columns"("admin_users" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_if_student_exists"("user_email" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  student_exists BOOLEAN;
BEGIN
  -- Check if the students table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'students'
  ) THEN
    -- Check if the student exists
    SELECT EXISTS(
      SELECT 1 
      FROM public.students 
      WHERE email = user_email
    ) INTO student_exists;
    
    RETURN student_exists;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;


ALTER FUNCTION "public"."check_if_student_exists"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_student"("user_email" "text", "user_username" "text", "user_password" "text", "user_phone" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Create the students table if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'students'
  ) THEN
    CREATE TABLE public.students (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone_number TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS policies
    ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
    
    -- Anyone can read students (needed for auth)
    CREATE POLICY "Anyone can read students" 
      ON public.students FOR SELECT 
      USING (true);
      
    -- Only authenticated users can insert students
    CREATE POLICY "Authenticated users can insert students" 
      ON public.students FOR INSERT 
      WITH CHECK (auth.role() = 'authenticated');
      
    -- Users can update their own student records
    CREATE POLICY "Users can update their own student records" 
      ON public.students FOR UPDATE 
      USING (auth.uid()::text = (
        SELECT id::text FROM auth.users WHERE email = email
      ));
  END IF;
  
  -- Insert the student
  INSERT INTO public.students (
    username,
    email,
    password,
    phone_number
  ) VALUES (
    user_username,
    user_email,
    user_password,
    user_phone
  );
END;
$$;


ALTER FUNCTION "public"."create_student"("user_email" "text", "user_username" "text", "user_password" "text", "user_phone" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."students" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "roll_number" "text" NOT NULL,
    "course" "text" NOT NULL,
    "semester" integer NOT NULL,
    "attendance" integer NOT NULL,
    "behavior_score" integer NOT NULL,
    "academic_score" integer DEFAULT 80 NOT NULL,
    "participation_score" integer DEFAULT 75 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "avatar_url" "text",
    "leaderboard_points" integer DEFAULT 0,
    "cgpa" numeric(3,2) DEFAULT 3.00
);


ALTER TABLE "public"."students" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_student_by_email"("user_email" "text") RETURNS SETOF "public"."students"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT *
  FROM public.students
  WHERE email = user_email;
$$;


ALTER FUNCTION "public"."get_student_by_email"("user_email" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" integer NOT NULL,
    "username" character varying(255) NOT NULL,
    "password" character varying(255) NOT NULL,
    "email" character varying(255),
    "phone_number" character varying(20),
    "reset_password_token" "text",
    "reset_password_expires" timestamp with time zone
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."admin_users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."admin_users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."admin_users_id_seq" OWNED BY "public"."admin_users"."id";



CREATE TABLE IF NOT EXISTS "public"."attendance_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."attendance_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."behavioral_incidents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "incident_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "text" NOT NULL,
    "description" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."behavioral_incidents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "instructor" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "color" "text" NOT NULL,
    "thumbnail_url" "text",
    "course" "text" NOT NULL,
    "created_by" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."course_cards" REPLICA IDENTITY FULL;


ALTER TABLE "public"."course_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_materials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_card_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "file_url" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "file_size" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."course_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."faculty" (
    "id" bigint NOT NULL,
    "username" "text" NOT NULL,
    "password" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone_number" "text",
    "reset_password_token" "text",
    "reset_password_expiry" timestamp with time zone,
    "name" "text",
    "department" "text",
    "chat_enabled" boolean DEFAULT false,
    "avatar_url" "text"
);


ALTER TABLE "public"."faculty" OWNER TO "postgres";


ALTER TABLE "public"."faculty" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."faculty_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "receiver_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "type" "text" NOT NULL,
    "read" boolean DEFAULT false,
    "recipient_id" "text",
    "recipient_role" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "student_id" "uuid"
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."personality_traits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "openness" integer DEFAULT 70 NOT NULL,
    "conscientiousness" integer DEFAULT 70 NOT NULL,
    "extraversion" integer DEFAULT 70 NOT NULL,
    "agreeableness" integer DEFAULT 70 NOT NULL,
    "neuroticism" integer DEFAULT 50 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."personality_traits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" integer NOT NULL,
    "user_id" integer,
    "user_email" "text",
    "avatar_url" "text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."profiles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."profiles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."profiles_id_seq" OWNED BY "public"."profiles"."id";



CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "sid" character varying NOT NULL,
    "sess" "json" NOT NULL,
    "expire" timestamp(6) without time zone NOT NULL
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_materials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "material_id" "uuid",
    "student_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."student_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teaching_materials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "file_url" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "file_size" integer NOT NULL,
    "course" "text",
    "uploaded_by" "text" NOT NULL,
    "shared_with_all" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "shared_with_course" "text"
);


ALTER TABLE "public"."teaching_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" integer NOT NULL,
    "username" character varying(255) NOT NULL,
    "password" character varying(255) NOT NULL,
    "email" character varying(255)
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";



ALTER TABLE ONLY "public"."admin_users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."admin_users_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."profiles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."profiles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_phone_number_key" UNIQUE ("phone_number");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."behavioral_incidents"
    ADD CONSTRAINT "behavioral_incidents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_cards"
    ADD CONSTRAINT "course_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_materials"
    ADD CONSTRAINT "course_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."faculty"
    ADD CONSTRAINT "faculty_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."personality_traits"
    ADD CONSTRAINT "personality_traits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_email_key" UNIQUE ("user_email");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid");



ALTER TABLE ONLY "public"."student_materials"
    ADD CONSTRAINT "student_materials_material_id_student_id_key" UNIQUE ("material_id", "student_id");



ALTER TABLE ONLY "public"."student_materials"
    ADD CONSTRAINT "student_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_roll_number_key" UNIQUE ("roll_number");



ALTER TABLE ONLY "public"."teaching_materials"
    ADD CONSTRAINT "teaching_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "idx_messages_created_at" ON "public"."messages" USING "btree" ("created_at");



CREATE INDEX "idx_messages_receiver_id" ON "public"."messages" USING "btree" ("receiver_id");



CREATE INDEX "idx_messages_sender_id" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_sessions_expire" ON "public"."sessions" USING "btree" ("expire");



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."behavioral_incidents"
    ADD CONSTRAINT "behavioral_incidents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_materials"
    ADD CONSTRAINT "course_materials_course_card_id_fkey" FOREIGN KEY ("course_card_id") REFERENCES "public"."course_cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."personality_traits"
    ADD CONSTRAINT "personality_traits_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_materials"
    ADD CONSTRAINT "student_materials_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."teaching_materials"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_materials"
    ADD CONSTRAINT "student_materials_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



CREATE POLICY "Admins and teachers can view all materials" ON "public"."teaching_materials" FOR SELECT USING (("auth"."role"() = ANY (ARRAY['admin'::"text", 'teacher'::"text"])));



CREATE POLICY "All users can view course_cards" ON "public"."course_cards" FOR SELECT USING (true);



CREATE POLICY "All users can view course_materials" ON "public"."course_materials" FOR SELECT USING (true);



CREATE POLICY "Allow delete for admins and teachers" ON "public"."course_materials" FOR DELETE USING (true);



CREATE POLICY "Allow delete for course creators" ON "public"."course_cards" FOR DELETE USING (("created_by" = "auth"."email"()));



CREATE POLICY "Allow insert for authenticated users" ON "public"."course_cards" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow insert for authenticated users" ON "public"."course_materials" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public read access" ON "public"."course_cards" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."course_materials" FOR SELECT USING (true);



CREATE POLICY "Allow reading admin_users" ON "public"."admin_users" FOR SELECT USING (true);



CREATE POLICY "Allow reading faculty" ON "public"."faculty" FOR SELECT USING (true);



CREATE POLICY "Allow reading users" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Allow update for course creators" ON "public"."course_cards" FOR UPDATE USING (("created_by" = "auth"."email"()));



CREATE POLICY "Anyone can read attendance_records" ON "public"."attendance_records" FOR SELECT USING (true);



CREATE POLICY "Anyone can read behavioral_incidents" ON "public"."behavioral_incidents" FOR SELECT USING (true);



CREATE POLICY "Anyone can read personality_traits" ON "public"."personality_traits" FOR SELECT USING (true);



CREATE POLICY "Anyone can read students" ON "public"."students" FOR SELECT USING (true);



CREATE POLICY "Anyone can view teaching materials" ON "public"."teaching_materials" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can insert attendance_records" ON "public"."attendance_records" FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated users can insert behavioral_incidents" ON "public"."behavioral_incidents" FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated users can insert personality_traits" ON "public"."personality_traits" FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated users can insert students" ON "public"."students" FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated users can update attendance_records" ON "public"."attendance_records" FOR UPDATE USING (true);



CREATE POLICY "Authenticated users can update behavioral_incidents" ON "public"."behavioral_incidents" FOR UPDATE USING (true);



CREATE POLICY "Authenticated users can update personality_traits" ON "public"."personality_traits" FOR UPDATE USING (true);



CREATE POLICY "Authenticated users can update students" ON "public"."students" FOR UPDATE USING (true);



CREATE POLICY "Enable insert for all users" ON "public"."admin_users" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for all users" ON "public"."faculty" FOR INSERT WITH CHECK (true);



CREATE POLICY "Students can view materials shared with all" ON "public"."teaching_materials" FOR SELECT USING ((("shared_with_all" = true) OR ("auth"."role"() = 'student'::"text")));



CREATE POLICY "Teachers and admins can delete materials" ON "public"."teaching_materials" FOR DELETE USING (("auth"."role"() = ANY (ARRAY['admin'::"text", 'teacher'::"text"])));



CREATE POLICY "Teachers can create course_cards" ON "public"."course_cards" FOR INSERT WITH CHECK (("auth"."role"() = ANY (ARRAY['teacher'::"text", 'admin'::"text"])));



CREATE POLICY "Teachers can create course_materials" ON "public"."course_materials" FOR INSERT WITH CHECK ((("auth"."role"() = ANY (ARRAY['teacher'::"text", 'admin'::"text"])) AND (EXISTS ( SELECT 1
   FROM "public"."course_cards"
  WHERE (("course_cards"."id" = "course_materials"."course_card_id") AND ("course_cards"."created_by" = "auth"."email"()))))));



CREATE POLICY "Teachers can delete their own course_cards" ON "public"."course_cards" FOR DELETE USING (("auth"."email"() = "created_by"));



CREATE POLICY "Teachers can delete their own course_materials" ON "public"."course_materials" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."course_cards"
  WHERE (("course_cards"."id" = "course_materials"."course_card_id") AND ("course_cards"."created_by" = "auth"."email"())))));



CREATE POLICY "Teachers can update their materials" ON "public"."teaching_materials" FOR UPDATE USING ((("auth"."role"() = ANY (ARRAY['admin'::"text", 'teacher'::"text"])) AND ("uploaded_by" = "auth"."email"())));



CREATE POLICY "Teachers can update their own course_cards" ON "public"."course_cards" FOR UPDATE USING (("auth"."email"() = "created_by"));



CREATE POLICY "Teachers can update their own course_materials" ON "public"."course_materials" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."course_cards"
  WHERE (("course_cards"."id" = "course_materials"."course_card_id") AND ("course_cards"."created_by" = "auth"."email"())))));



CREATE POLICY "Teachers can upload materials" ON "public"."teaching_materials" FOR INSERT WITH CHECK (("auth"."role"() = ANY (ARRAY['admin'::"text", 'teacher'::"text"])));



CREATE POLICY "Users can mark messages as read" ON "public"."messages" FOR UPDATE USING ((("receiver_id")::"text" = ("auth"."uid"())::"text"));



CREATE POLICY "Users can send messages" ON "public"."messages" FOR INSERT WITH CHECK ((("sender_id")::"text" = ("auth"."uid"())::"text"));



CREATE POLICY "Users can upload teaching materials" ON "public"."teaching_materials" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can view their own messages" ON "public"."messages" FOR SELECT USING (((("sender_id")::"text" = ("auth"."uid"())::"text") OR (("receiver_id")::"text" = ("auth"."uid"())::"text")));



ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attendance_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."behavioral_incidents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_cards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_materials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."personality_traits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_materials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teaching_materials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."course_cards";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."add_reset_columns"("admin_users" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_reset_columns"("admin_users" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_reset_columns"("admin_users" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_if_student_exists"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_if_student_exists"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_if_student_exists"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_student"("user_email" "text", "user_username" "text", "user_password" "text", "user_phone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_student"("user_email" "text", "user_username" "text", "user_password" "text", "user_phone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_student"("user_email" "text", "user_username" "text", "user_password" "text", "user_phone" "text") TO "service_role";



GRANT ALL ON TABLE "public"."students" TO "anon";
GRANT ALL ON TABLE "public"."students" TO "authenticated";
GRANT ALL ON TABLE "public"."students" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_student_by_email"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_student_by_email"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_student_by_email"("user_email" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."admin_users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."admin_users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."admin_users_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."attendance_records" TO "anon";
GRANT ALL ON TABLE "public"."attendance_records" TO "authenticated";
GRANT ALL ON TABLE "public"."attendance_records" TO "service_role";



GRANT ALL ON TABLE "public"."behavioral_incidents" TO "anon";
GRANT ALL ON TABLE "public"."behavioral_incidents" TO "authenticated";
GRANT ALL ON TABLE "public"."behavioral_incidents" TO "service_role";



GRANT ALL ON TABLE "public"."course_cards" TO "anon";
GRANT ALL ON TABLE "public"."course_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."course_cards" TO "service_role";



GRANT ALL ON TABLE "public"."course_materials" TO "anon";
GRANT ALL ON TABLE "public"."course_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."course_materials" TO "service_role";



GRANT ALL ON TABLE "public"."faculty" TO "anon";
GRANT ALL ON TABLE "public"."faculty" TO "authenticated";
GRANT ALL ON TABLE "public"."faculty" TO "service_role";



GRANT ALL ON SEQUENCE "public"."faculty_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."faculty_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."faculty_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."personality_traits" TO "anon";
GRANT ALL ON TABLE "public"."personality_traits" TO "authenticated";
GRANT ALL ON TABLE "public"."personality_traits" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON TABLE "public"."student_materials" TO "anon";
GRANT ALL ON TABLE "public"."student_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."student_materials" TO "service_role";



GRANT ALL ON TABLE "public"."teaching_materials" TO "anon";
GRANT ALL ON TABLE "public"."teaching_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."teaching_materials" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
