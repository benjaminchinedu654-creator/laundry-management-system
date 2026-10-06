-- Create orders table
CREATE TABLE IF NOT EXISTS `orders` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_code`       VARCHAR(20)     NOT NULL,          -- e.g. "LDR-20260101-0007"
  `user_id`          BIGINT UNSIGNED NOT NULL,
  `status`           ENUM('pending','picked_up','washing','ready','out_for_delivery','delivered','cancelled')
                     NOT NULL DEFAULT 'pending',
  `pickup_address`   VARCHAR(255)    NOT NULL,
  `pickup_date`      DATE            NOT NULL,
  `pickup_time`      TIME            NOT NULL,
  `delivery_address` VARCHAR(255)    NOT NULL,
  `delivery_date`    DATE            NOT NULL,
  `delivery_time`    TIME            NOT NULL,
  `special_notes`    TEXT            DEFAULT NULL,
  `subtotal`         DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `total`            DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `payment_status`   ENUM('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
  `created_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_orders_code` (`order_code`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status` (`status`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;