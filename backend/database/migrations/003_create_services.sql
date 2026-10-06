CREATE TABLE IF NOT EXISTS `services` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`           VARCHAR(100)    NOT NULL,   -- e.g. "Shirt", "Trouser", "Bedsheet"
  `category`       VARCHAR(50)     NOT NULL,   -- e.g. "Wash & Iron", "Dry Clean", "Iron Only"
  `unit_price`     DECIMAL(10,2)   NOT NULL,   -- price per item
  `description`    VARCHAR(255)    DEFAULT NULL,
  `is_available`   TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_services_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;