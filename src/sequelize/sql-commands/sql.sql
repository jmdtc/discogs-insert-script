-- SEARCH FOR SAME TRACKS
SELECT releases.id, tracks.title as track, releases.title as release_title, artists.name,
country, release_date, master_id, label_id FROM releases
INNER JOIN artist_releases                                                                                                                                                                                  ON releases.id = artist_releases.release_id
INNER JOIN artists
ON artist_releases.artist_id = artists.id
INNER JOIN tracks
ON tracks.release_id = releases.id
WHERE LOWER(tracks.title) LIKE '%spies%'
AND LOWER(artists.name) LIKE '%beat%'
ORDER BY releases.id  LIMIT 10;








-- SEARCH FOR SAME TRACKS
SELECT 
    releases.id
    , tracks.title as track
    , releases.title as release_title
    , artists.name
    , country
    , release_date
    , master_id
    , label_id 
FROM releases
INNER JOIN 
    artist_releases                                                                                     
    ON releases.id = artist_releases.release_id
INNER JOIN 
    artists
    ON artist_releases.artist_id = artists.id
INNER JOIN 
    tracks
ON tracks.release_id = releases.id
WHERE LOWER(tracks.title) LIKE '%make the music%'
AND LOWER(artists.name) LIKE '%herbert%'
ORDER BY releases.id  LIMIT 10;



SELECT
    releases.id
    , country
    , releases.title as release_title
    , release_date
    , master_id
    , label_id 
    , releases.title as release_title
    , styles.name as style
FROM releases
INNER JOIN release_styles
ON releases.id = release_styles.release_id
INNER JOIN styles
ON styles.id = release_styles.style_id
WHERE releases.release_date IS NULL
AND styles.name = 'House';

docker exec postgres-db pg_dump -U unicorn_user -p 6000 -d rainbow_database > ./database/test7.sql
docker exec postgres-db pg_dump --create -U unicorn_user -p 6000 -d rainbow_database > ./database/test8.sql




UPDATE releases
SET master_id = 129909,
label_id = 940
WHERE id = 398147


cat ./database/discogs-db.sql | docker exec -i postgres-db psql -p 6000 -U unicorn_user -d rainbow_database