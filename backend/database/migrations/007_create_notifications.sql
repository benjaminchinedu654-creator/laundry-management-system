CREATE TABLE IF NOT EXISTS `notifications` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `order_id`      BIGINT UNSIGNED DEFAULT NULL,
  `channel`       ENUM('email','sms','in_app') NOT NULL DEFAULT 'in_app',
  `title`         VARCHAR(150)    NOT NULL,
  `message`       TEXT            NOT NULL,
  `is_read`       TINYINT(1)      NOT NULL DEFAULT 0,
  `sent_at`       DATETIME        DEFAULT NULL,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_order` (`order_id`),
  CONSTRAINT `fk_notifications_user`  FOREIGN KEY (`user_id`)  REFERENCES `users` (`id`)  ON DELETE CASCADE,
  CONSTRAINT `fk_notifications_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;