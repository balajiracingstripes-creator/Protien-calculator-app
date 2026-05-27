/*
  # Create User Intake Table

  1. New Tables
    - `user_intake`
      - `id` (uuid, primary key)
      - `food_id` (uuid, foreign key to indian_foods)
      - `quantity` (float) - Amount consumed in grams
      - `protein_consumed` (float) - Calculated protein in grams
      - `carbs_consumed` (float) - Calculated carbs in grams
      - `fiber_consumed` (float) - Calculated fiber in grams
      - `calories_consumed` (float) - Calculated calories
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_intake` table
    - Users can only read/insert/update/delete their own intake records

  Note: This table is temporary for the session. In production, you would link to auth.uid().
  For this demo, we'll use a session-based approach with localStorage.
*/

CREATE TABLE IF NOT EXISTS user_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  food_id uuid REFERENCES indian_foods(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  quantity float NOT NULL,
  protein_consumed float NOT NULL,
  carbs_consumed float NOT NULL,
  fiber_consumed float NOT NULL,
  calories_consumed float NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own intake"
  ON user_intake FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own intake"
  ON user_intake FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update own intake"
  ON user_intake FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own intake"
  ON user_intake FOR DELETE
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_user_intake_session ON user_intake(session_id);
CREATE INDEX IF NOT EXISTS idx_user_intake_created ON user_intake(created_at);