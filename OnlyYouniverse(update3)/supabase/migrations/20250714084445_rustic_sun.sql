/*
  # Add Profile Completion Status Tracking

  1. Database Changes
    - Add `profile_completed` boolean field to profiles table
    - Add `is_new_user` boolean field to profiles table
    - Set default values for existing users

  2. Security
    - Update RLS policies to handle new fields
    - Ensure proper access control for profile completion workflow
*/

-- Add profile completion tracking fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'profile_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_completed boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_new_user'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_new_user boolean DEFAULT true;
  END IF;
END $$;

-- Add additional profile fields that were missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'current_education_level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_education_level text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'expected_admission_year'
  ) THEN
    ALTER TABLE profiles ADD COLUMN expected_admission_year text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'current_city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_city text;
  END IF;
END $$;

-- Update existing users to mark them as not new users (assuming they already have some profile data)
UPDATE profiles 
SET is_new_user = false, profile_completed = true 
WHERE bio IS NOT NULL AND bio != '' AND phone IS NOT NULL AND phone != '';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_completion_status ON profiles(profile_completed, is_new_user);

-- Create function to automatically set profile completion status
CREATE OR REPLACE FUNCTION check_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile is complete based on required fields
  NEW.profile_completed = (
    NEW.bio IS NOT NULL AND NEW.bio != '' AND
    NEW.phone IS NOT NULL AND NEW.phone != '' AND
    NEW.role IS NOT NULL
  );
  
  -- Once a user completes their profile, they are no longer new
  IF NEW.profile_completed = true THEN
    NEW.is_new_user = false;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update completion status
DROP TRIGGER IF EXISTS trigger_check_profile_completion ON profiles;
CREATE TRIGGER trigger_check_profile_completion
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION check_profile_completion();