CREATE DATABASE IF NOT EXISTS tenanttrails;
USE tenanttrails;

DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS apartments;

CREATE TABLE apartments (
  id INT NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  address VARCHAR(200) NOT NULL,
  neighbourhood VARCHAR(80) NOT NULL,
  landlord VARCHAR(120),
  units INT,
  built INT,
  verified TINYINT(1) DEFAULT 0
);

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  initials VARCHAR(5)
);

CREATE TABLE reviews (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  apt_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT NOT NULL,
  body TEXT NOT NULL,
  created DATE NOT NULL,
  CONSTRAINT fk_reviews_apartment
    FOREIGN KEY (apt_id) REFERENCES apartments(id),
  CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  user_id INT NOT NULL,
  body TEXT NOT NULL,
  created DATETIME NOT NULL,
  CONSTRAINT fk_comments_review
    FOREIGN KEY (review_id) REFERENCES reviews(id),
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO apartments (id, name, address, neighbourhood, landlord, units, built, verified) VALUES
  (1, 'The Marlstone', '5640 Spring Garden Rd', 'Spring Garden', 'Harbour Living', 72, 1985, 1),
  (2, 'Park Victoria', '1496 Carlton St', 'South End', 'Victoria Rentals', 104, 1992, 1),
  (3, 'Le Marchant Towers', '1585 Le Marchant St', 'West End', 'Killam Properties', 88, 1976, 1),
  (4, 'Fenwick Tower', '5599 Fenwick St', 'Downtown', 'Downtown Residential', 120, 1971, 0),
  (5, 'Southpoint Apartments', '1050 South Park St', 'South End', 'Southpoint Group', 64, 2001, 0);

INSERT INTO users (id, name, email, password, initials) VALUES
  (1, 'Alex Mitchell', 'alex@dal.ca', '$2b$10$z4GA99A6d15Jj5hcLsTEQe9M/lBupgTulko2WaLnv.PihExU/Ryhi', 'AM'),
  (2, 'James Chen', 'james@example.com', '$2b$10$z4GA99A6d15Jj5hcLsTEQe9M/lBupgTulko2WaLnv.PihExU/Ryhi', 'JC'),
  (3, 'Sarah Patel', 'sarah@example.com', '$2b$10$z4GA99A6d15Jj5hcLsTEQe9M/lBupgTulko2WaLnv.PihExU/Ryhi', 'SP'),
  (4, 'Maya Thompson', 'maya@example.com', '$2b$10$z4GA99A6d15Jj5hcLsTEQe9M/lBupgTulko2WaLnv.PihExU/Ryhi', 'MT');

INSERT INTO reviews (id, apt_id, user_id, rating, body, created) VALUES
  (1, 1, 1, 5, 'Great location and very quiet. Maintenance responded quickly whenever I had an issue.', '2026-04-12'),
  (2, 2, 2, 5, 'The building is clean and well maintained. It is expensive, but the location is excellent.', '2026-04-03'),
  (3, 2, 1, 4, 'Quiet neighbours and good management. Rent is high, but overall it was a good experience.', '2026-04-10'),
  (4, 3, 2, 4, 'Good building overall. Management is responsive, but parking is usually hard to find.', '2026-04-01'),
  (5, 3, 1, 4, 'Lived here for two years. Quiet neighbours, solid construction, and convenient location.', '2026-04-19'),
  (6, 3, 3, 3, 'The location is good, but the building feels old. Maintenance can take time.', '2026-03-22'),
  (7, 4, 1, 3, 'The view from the 28th floor is incredible. Elevators are unreliable during busy times.', '2026-03-18'),
  (8, 5, 4, 2, 'Good location near the park, but heater issues took several days to fix.', '2026-02-12');

INSERT INTO comments (id, review_id, user_id, body, created) VALUES
  (1, 4, 1, 'How long was the parking wait when you moved in?', '2026-04-02 13:30:00'),
  (2, 4, 2, 'It was around five months when I first applied.', '2026-04-02 16:45:00'),
  (3, 7, 3, 'Did management communicate during elevator outages?', '2026-03-19 12:15:00'),
  (4, 3, 4, 'Was the noise level okay during exams?', '2026-04-11 21:20:00'),
  (5, 8, 1, 'I had a similar issue with heating in winter.', '2026-02-14 12:05:00');

ALTER TABLE users AUTO_INCREMENT = 5;
ALTER TABLE reviews AUTO_INCREMENT = 9;
ALTER TABLE comments AUTO_INCREMENT = 6;
