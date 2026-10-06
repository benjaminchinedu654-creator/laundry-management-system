CREATE TABLE IF NOT EXISTS `users` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name`      VARCHAR(120)    NOT NULL,
  `email`          VARCHAR(150)    NOT NULL,
  `phone`          VARCHAR(20)     NOT NULL,
  `password_hash`  VARCHAR(255)    NOT NULL,
  `address`        VARCHAR(255)    DEFAULT NULL,
  `is_active`      TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_users_email` (`email`),
  UNIQUE KEY `uniq_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;