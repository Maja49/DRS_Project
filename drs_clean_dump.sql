
-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: drs_clean
-- ------------------------------------------------------
-- Server version	8.0.13

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES=0 */;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `text` text NOT NULL,
  `mentioned_user_id` int(11) DEFAULT NULL,
  `discussion_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `mentioned_user_id` (`mentioned_user_id`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`mentioned_user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

INSERT INTO `comment` VALUES (2,2,'Test comment',NULL,6),(3,6,'ovo je prvi komentar',NULL,6),(4,6,'ovo je drugi komentar',NULL,6),(5,6,'ovo je treci komentar',NULL,6),(6,6,'ovo je sesti komentar',NULL,6),(7,8,'Sla??em se sa @natali.',NULL,6),(8,8,'Sla??em se sa @natali',NULL,6),(9,8,'Sla??em se sa @maca',NULL,6),(10,8,'Sla??em se sa @marko. Ovo je odli??an komentar!',NULL,6),(11,8,'Sla??em se sa @natali . Ovo je odli??an komentar!',2,6),(12,8,'Sla??em se sa @idemo . Ovo je odli??an komentar!',10,6),(13,8,'Sla??em se sa @idemo . Ovo je odli??an komentar!',10,6),(14,8,'Sla??em se sa @idemo . Ovo je odli??an komentar!',10,6),(16,8,'Sla??em se sa @idemo . Ovo je odli??an komentar!',10,6),(17,8,'Sla??em se sa @natali . Ovo je odli??an komentar!',2,6),(18,8,'Slazem se sa @natali . Ovo je odlican komentar!',2,6),(19,8,'Slazem se sa @natali . Ovo je odlican komentar!',2,6),(21,8,'@natali',2,6),(22,8,'@natali',2,6),(23,8,'@natali',2,6),(24,8,'@idemo',10,6),(25,8,'@idemo',10,6),(26,8,'@idemo',10,6),(27,8,'evo jos jednog',NULL,7);

--
-- Table structure for table `commentdiscussion`
--

DROP TABLE IF EXISTS `commentdiscussion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commentdiscussion` (
  `comment_id` int(11) NOT NULL,
  `discussion_id` int(11) NOT NULL,
  PRIMARY KEY (`comment_id`,`discussion_id`),
  KEY `discussion_id` (`discussion_id`),
  CONSTRAINT `commentdiscussion_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commentdiscussion_ibfk_2` FOREIGN KEY (`discussion_id`) REFERENCES `discussion` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commentdiscussion`
--

INSERT INTO `commentdiscussion` VALUES (4,6),(5,6),(6,6),(7,6),(8,6),(9,6),(27,7);
/*!40000 ALTER TABLE `commentdiscussion` ENABLE KEYS */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `discussion_id` int(11) NOT NULL,
  `text` varchar(255) NOT NULL,
  `mentioned_user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `discussion_id` (`discussion_id`),
  KEY `mentioned_user_id` (`mentioned_user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`discussion_id`) REFERENCES `discussion` (`id`),
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`mentioned_user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` VALUES (1,6,6,'ovo je prvi komentar',NULL);

--
-- Table structure for table `discussion`
--

DROP TABLE IF EXISTS `discussion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discussion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` text NOT NULL,
  `theme_id` int(11) NOT NULL,
  `likes` int(11) DEFAULT '0',
  `dislikes` int(11) DEFAULT '0',
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `title` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `theme_id` (`theme_id`),
  CONSTRAINT `discussion_ibfk_1` FOREIGN KEY (`theme_id`) REFERENCES `theme` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discussion`
--

INSERT INTO `discussion` VALUES (6,'Ovo je tekst diskusije',5,0,0,11,'2024-12-09 15:24:55',NULL,'Naslov diskusije'),(7,'Resavamo ovo najlaganije',6,0,0,11,'2024-12-09 15:38:44',NULL,'Ide gas');

--
-- Table structure for table `like_dislike`
--

DROP TABLE IF EXISTS `like_dislike`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `like_dislike` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `discussion_id` int(11) NOT NULL,
  `action` enum('like','dislike') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `discussion_id` (`discussion_id`),
  CONSTRAINT `like_dislike_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `like_dislike_ibfk_2` FOREIGN KEY (`discussion_id`) REFERENCES `discussion` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `theme`
--

DROP TABLE IF EXISTS `theme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `theme` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`(191))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Dumping data for table `theme`
--

INSERT INTO `theme` VALUES (5,'Movies','All genres and top 10 recommondations','2024-12-09 15:41:40','2024-12-09 15:41:40'),(6,'Fakulteti','Obrazovne ustanove','2024-12-09 16:18:26','2024-12-09 16:18:26');

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `adress` varchar(100) NOT NULL,
  `city` varchar(50) NOT NULL,
  `country` varchar(50) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `is_admin` tinyint(1) NOT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  `is_first_login` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--
INSERT INTO `user` VALUES (2,'Natalija','Celic','Nova Adresa 888','Banjaluka','Serbia','1234567890','natali@example.com','scrypt:32768:8:1$3nSlvX2NOByIaREp$5c1b37711eba72edbd4826bf82aedf25f8c0d9166f5284d74082194b357c7f22612006dbeea0bf7a86155242820eeb8533fd515fe611465f4561d70c753ab7b0','natali',0,1,1),(6,'Laza','Lazic','Neka Adresa 888','Budimpesta','Serbia','+38761234567','laza@example.com','lacko','primer1',1,1,0),(7,'John','Doe','123 Main St','Springfield','USA','123456789','johndoe@example.com','password123','john_doe',0,1,0),(8,'Nadja','Sekulic','Castle ','Banja Luka','Republika Srpska','+38765256888','nadja@example.com','nadjeks','nadja',0,1,0),(10,'resi','dkc','ndncjn','dndn','DOCPKKD','00000','resi@example.com','resi','idemo',0,1,1),(11,'mjau','jwdj','nkwdnk','ndwdn','jdjdw','0000000','mjau@example.com','mjau','maca',0,1,1),(12,'proba','probic','lalaland','lalaland','lali','065888888','proba@example.com','proba','probica',0,1,0),(15,'molim te','boze','dubai dd','dubai','emirati','888','boze@example.com','123','boze',0,1,0);
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-26 20:39:30
