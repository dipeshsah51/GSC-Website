-- =====================================================================
-- Genting Services & Contracting W.L.L. (Doha, Qatar)
-- Production MySQL Database Schema & Initial Data
-- Compatible with phpMyAdmin (InfinityFree / cPanel / MariaDB / MySQL)
-- =====================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+03:00"; -- Qatar Timezone (UTC+3)

-- --------------------------------------------------------
-- Table structure for table `gsc_users`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `gsc_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Dumping initial Admin User for table `gsc_users`
-- Email: admin@gsc-qatar.com | Password: admin123456
-- --------------------------------------------------------

INSERT INTO `gsc_users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'GSC System Administrator', 'admin@gsc-qatar.com', '$2y$10$8oTZoF1k2Wv1QPZ2HR1LROuHGKOMM56f65DS.oFwedMO52MrYF.pe', 'admin')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- --------------------------------------------------------
-- Table structure for table `gsc_quotes`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `gsc_quotes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `referenceId` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `company` VARCHAR(150) DEFAULT '',
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `service` VARCHAR(150) NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `contractType` VARCHAR(100) DEFAULT 'One-Time Project',
  `timeline` VARCHAR(100) DEFAULT 'Immediately (Within 48 hours)',
  `notes` TEXT NOT NULL,
  `estimatedBudget` VARCHAR(100) DEFAULT '',
  `status` VARCHAR(50) DEFAULT 'Pending',
  `adminNotes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `gsc_contacts`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `gsc_contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `subject` VARCHAR(200) DEFAULT 'General Service Inquiry',
  `message` TEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'New',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `gsc_projects`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `gsc_projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` VARCHAR(50) DEFAULT NULL,
  `title` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `service` VARCHAR(150) NOT NULL,
  `location` VARCHAR(150) DEFAULT 'Doha, Qatar',
  `client` VARCHAR(150) DEFAULT 'Confidential Client',
  `year` VARCHAR(50) DEFAULT '2024-2025',
  `imageUrl` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `scope` TEXT DEFAULT NULL,
  `stats` VARCHAR(100) DEFAULT 'Delivered On Schedule',
  `featured` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Dumping Qatar Landmark Projects
-- --------------------------------------------------------

INSERT INTO `gsc_projects` (`project_id`, `title`, `category`, `service`, `location`, `client`, `year`, `imageUrl`, `description`, `scope`, `stats`, `featured`) VALUES
('proj_1', 'Lusail Marina Commercial Tower', 'Commercial Facility', 'Cleaning & Hospitality', 'Lusail Marina, Doha', 'Lusail Real Estate', '2024', '/assets/cleaning-hospitality-CkHw0R7y.jpg', 'Full-scale corporate cleaning, deep sanitization, and hospitality staffing for a 32-story landmark tower.', '[\"Daily Janitorial Services\", \"High-Rise Fa\u00e7ade Cleaning\", \"Executive Hospitality Staff\", \"Marble Polishing\"]', '32 Floors • 100% SLA Met', 1),
('proj_2', 'Doha Metro Infrastructure Maintenance', 'Infrastructure', 'Trading & Contracting', 'Doha Metro Stations, Qatar', 'Rail Contracting Consortium', '2024', '/assets/trading-contracting-Cqwkph8n.jpg', 'Specialized building materials supply, maintenance workforce deployment, and MEP contracting support.', '[\"Procurement of Technical Supplies\", \"Certified MEP Technicians\", \"Emergency Repair Dispatch\", \"Safety Audit Compliance\"]', '5 Stations Maintained', 1),
('proj_3', 'The Pearl-Qatar Luxury Residences', 'Residential & Luxury', 'Maintenance & Fit-Out', 'Porto Arabia, The Pearl', 'Private Residential Association', '2024', '/assets/maintenance-BBbh81po.jpg', 'Round-the-clock MEP maintenance, preventive HVAC overhauls, plumbing, and luxury interior fit-outs.', '[\"24/7 Rapid Response Team\", \"Chilled Water AC Maintenance\", \"Electrical Load Distribution\", \"Luxury Interior Renovations\"]', '180 Units Serviced', 1),
('proj_4', 'West Bay Corporate Headquarters', 'Corporate Towers', 'Manpower Supply', 'West Bay Diplomatic Area, Doha', 'Multi-Tenant Commercial Group', '2024', '/assets/manpower-supply-D3PN3k_Z.jpg', 'Deployment of 85+ vetted, multilingual facility associates, reception hosts, and certified technicians.', '[\"Bilingual Concierge Services\", \"Certified MEP Technicians\", \"Continuous Workforce Management\", \"Full Ministry of Labour Compliance\"]', '85+ Personnel Deployed', 1);

COMMIT;
