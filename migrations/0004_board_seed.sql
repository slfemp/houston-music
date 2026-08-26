-- Migration number: 0004    Real board roster (no demo data — ever)
-- password_hash is a placeholder: authentication is magic-link only.
-- Login allowlist stays the admins table; a users row grants a console
-- identity + role once that email can sign in.

INSERT INTO users (id, email, name, password_hash, role, active, created_at) VALUES
  (1, 'mike@slfemp.com',            'Michael "Frost" Moore', 'magic-link', 'admin',   1, unixepoch()*1000),
  (2, 'gracie@bombontexas.com',     'Gracie Chávez',         'magic-link', 'admin',   1, unixepoch()*1000),
  (3, 'flashgparks@gmail.com',      'Jason Woods',           'magic-link', 'officer', 1, unixepoch()*1000),
  (4, 'marissa@rukaz.work',         'Marissa Saenz',         'magic-link', 'officer', 1, unixepoch()*1000),
  (5, 'driabookings@gmail.com',     'Dria Thornton',         'magic-link', 'officer', 1, unixepoch()*1000),
  (6, 'bgirlcity.babygirl@gmail.com','Ericka De Leon',       'magic-link', 'member',  1, unixepoch()*1000),
  (7, 'henry.guidry@board.invalid', 'Henry Guidry',          'magic-link', 'member',  1, unixepoch()*1000),
  (8, 'jagi@pegstar.net',           'Jagi Kaital',           'magic-link', 'member',  1, unixepoch()*1000),
  (9, 'loop61059@gmail.com',        'Lupe Olivarez',         'magic-link', 'member',  1, unixepoch()*1000);

INSERT INTO members (user_id, position, organization, seated, created_at) VALUES
  (3, 'chair',      'Mo Better Brews', 1, unixepoch()*1000),
  (4, 'vice_chair', 'Rukaz Kultura', 1, unixepoch()*1000),
  (2, 'secretary',  'Bombón Texas', 1, unixepoch()*1000),
  (5, 'treasurer',  'FrontRunnaz Ent.', 1, unixepoch()*1000),
  (6, 'member',     'Hip Hop Vintage Flea Market, Bgirl City', 1, unixepoch()*1000),
  (7, 'member',     'SwishaHouse', 1, unixepoch()*1000),
  (8, 'member',     'White Oak Music Hall', 1, unixepoch()*1000),
  (1, 'alternate',  'SLFEMP', 1, unixepoch()*1000),
  (9, 'alternate',  NULL, 1, unixepoch()*1000);
