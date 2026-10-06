CREATE TABLE IF NOT EXISTS `order_items` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`     BIGINT UNSIGNED NOT NULL,
  `service_id`   BIGINT UNSIGNED NOT NULL,
  `service_name` VARCHAR(100)    NOT NULL,   -- snapshot of name at order time
  `category`     VARCHAR(50)     NOT NULL,   -- snapshot of category
  `quantity`     INT UNSIGNED    NOT NULL DEFAULT 1,
  `unit_price`   DECIMAL(10,2)   NOT NULL,   -- snapshot of price at order time
  `line_total`   DECIMAL(10,2)   NOT NULL,
  `created_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_items_order` (`order_id`),
  KEY `idx_items_service` (`service_id`),
  CONSTRAINT `fk_items_order`   FOREIGN KEY (`order_id`)   REFERENCES `orders` (`id`)   ON DELETE CASCADE,
  CONSTRAINT `fk_items_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;