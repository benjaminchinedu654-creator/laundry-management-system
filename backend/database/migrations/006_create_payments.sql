CREATE TABLE IF NOT EXISTS `payments` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`       BIGINT UNSIGNED NOT NULL,
  `user_id`        BIGINT UNSIGNED NOT NULL,
  `amount`         DECIMAL(10,2)   NOT NULL,
  `method`         ENUM('cash','card','transfer') NOT NULL,
  `status`         ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  `reference`      VARCHAR(64)     DEFAULT NULL,   -- gateway reference
  `paid_at`        DATETIME        DEFAULT NULL,
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_payments_reference` (`reference`),
  KEY `idx_payments_order` (`order_id`),
  KEY `idx_payments_user`  (`user_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_user`  FOREIGN KEY (`user_id`)  REFERENCES `users`  (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;