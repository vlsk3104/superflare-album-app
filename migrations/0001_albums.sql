-- Migration number: 0001 	 2023-04-04T07:24:34.506Z
-- Autogenerated by Superflare. Do not edit this file directly.
CREATE TABLE albums (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  userId INTEGER NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);