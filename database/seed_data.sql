-- MySQL dump 10.13  Distrib 9.6.0, for macos26.3 (arm64)
--
-- Host: localhost    Database: ecommerce_cart_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '7c45360a-2be9-11f1-a513-1840fa24c56f:1-171';

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `price` float NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `stock` int NOT NULL,
  `alcohol_type` varchar(100) DEFAULT NULL,
  `flavor_profile` varchar(100) DEFAULT NULL,
  `difficulty` varchar(50) DEFAULT NULL,
  `occasion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Cucumber Salad Single','Hendrick\'s Gin, Mezcal, Olive Brine',35,'/images/cucumber-salad.png','Savory / Fresh',12,NULL,NULL,NULL,NULL),(2,'Pineappu Beach Single','Japanese Whisky, Yuzu Umeshu, Pineapple Cordial',38,'/images/pineappu-beach.png','Sweet / Sour',10,NULL,NULL,NULL,NULL),(3,'Shima Fizzy Kit','Mezcal, Dashi, Watermelon Soda',75,'/images/shima-fizzy.png','Fizzy / Experimental',8,NULL,NULL,NULL,NULL),(4,'Smoky Chile & Honey','Islay Whisky, Scotch Whisky, Chile Pepper Liqueur, Elderflower Liqueur, Honey, Lemon',39,'/images/smoky-chile-honey.png','Sweet & Sour',10,NULL,NULL,NULL,NULL),(5,'Carrot Cake','Suntory Kakubin Whisky, White Rum, Lillet Blanc, Butter, Carrot Juice, Almond Milk, Orgeat, Cinnamon, Lemon',39,'/images/carrot-cake.png','Sweet & Sour',10,NULL,NULL,NULL,NULL),(6,'Tomato Cobbler','Fino Sherry, Tomato Syrup, Lemon Juice',35,'/images/tomato-cobbler.png','Sweet & Sour',10,NULL,NULL,NULL,NULL),(7,'Kicu In The Sidecar','Chrysanthemum Sake, Apricot Liqueur, D.O.M Benedictine, Lemon',39,'/images/kicu-sidecar.png','Sweet & Sour',10,NULL,NULL,NULL,NULL),(8,'Shiozakura Collins','Roku Gin, Sakura Vermouth, Shio-zakura Saline Solution, Lemon, Simple Syrup, CO2',38,'/images/shiozakura-collins.png','Refreshing',10,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04 11:07:19
