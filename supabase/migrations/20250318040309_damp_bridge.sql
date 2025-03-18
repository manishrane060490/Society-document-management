/*
  # Add author name to comments

  1. Changes
    - Add author_name column to comments table
    - Make author_name required for new comments
*/

ALTER TABLE comments
ADD COLUMN author_name text NOT NULL DEFAULT 'Anonymous';

-- Remove the default after adding the column
ALTER TABLE comments
ALTER COLUMN author_name DROP DEFAULT;