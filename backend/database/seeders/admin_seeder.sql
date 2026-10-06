INSERT INTO `admins` (`full_name`, `email`, `password_hash`, `is_active`)
VALUES (
  'Super Admin',
  'admin@laundryapp.com',
  '$2y$12$e0KfS7yZm8zGq6L5d7C0Xe6J.q0wJbA4Z7hF9kL3mN1pQ2rS3tU4v',
  1
)
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;