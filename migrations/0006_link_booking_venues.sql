-- Migration number: 0006    One venue list: booking directory links to the network graph
-- booking_venues rows extend graph venue nodes with artist-facing booking intel.
ALTER TABLE booking_venues ADD COLUMN node_id TEXT REFERENCES nodes(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX idx_booking_venues_node ON booking_venues(node_id);

-- Seed the directory from every VETTED venue node (proposed ones join when approved).
INSERT INTO booking_venues (node_id, name, address, neighborhood, venue_type, website_url, lat, lng, published, created_at)
SELECT
  id,
  name,
  json_extract(data, '$.address'),
  json_extract(data, '$.area'),
  CASE
    WHEN lower(name) LIKE '%theat%' THEN 'theater'
    WHEN json_extract(data, '$.venueType') = 'outdoor' THEN 'outdoor'
    WHEN json_extract(data, '$.venueType') = 'studio' THEN 'other'
    WHEN lower(name) LIKE '%bar%' OR lower(name) LIKE '%pub%' OR lower(name) LIKE '%saloon%' THEN 'bar'
    ELSE 'club'
  END,
  json_extract(data, '$.website'),
  CAST(json_extract(data, '$.lat') AS TEXT),
  CAST(json_extract(data, '$.lng') AS TEXT),
  0,
  unixepoch() * 1000
FROM nodes
WHERE type = 'venue' AND status = 'active';
