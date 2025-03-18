/*
  # Update RLS policies to allow public access

  1. Changes
    - Remove RLS from documents and comments tables
    - Allow public access to all operations
*/

ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;