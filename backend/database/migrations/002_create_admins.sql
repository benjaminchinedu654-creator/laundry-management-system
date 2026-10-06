CREATE TABLE IF NOT EXISTS `admins` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name`      VARCHAR(120)    NOT NULL,
  `email`          VARCHAR(150)    NOT NULL,
  `password_hash`  VARCHAR(255)    NOT NULL,
  `is_active`      TINYINT(1)      NOT NULL DEFAULT 1,
  `last_login_at`  DATETIME        DEFAULT NULL,
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;