-- MySQL dump 10.13  Distrib 8.0.45, for Linux (aarch64)
--
-- Host: localhost    Database: netverify
-- ------------------------------------------------------
-- Server version	8.0.45

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

--
-- Table structure for table `access_control_permissions`
--

DROP TABLE IF EXISTS `access_control_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_control_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `module` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_e6dd6e3dc55eba8df3adcc26ad` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_control_permissions`
--

LOCK TABLES `access_control_permissions` WRITE;
/*!40000 ALTER TABLE `access_control_permissions` DISABLE KEYS */;
INSERT INTO `access_control_permissions` VALUES (1,'user:read','查看用户列表','user','2026-02-08 06:47:20.462610','2026-02-08 08:07:05.000000'),(2,'user:create','创建用户','user','2026-02-08 06:47:20.469078','2026-02-08 08:07:05.000000'),(3,'user:update','更新用户','user','2026-02-08 06:47:20.471311','2026-02-08 08:07:05.000000'),(4,'user:delete','删除用户','user','2026-02-08 06:47:20.473185','2026-02-08 08:07:05.000000'),(5,'role:read','查看角色列表','system','2026-02-08 06:47:20.474765','2026-02-08 08:07:05.000000'),(6,'role:create','创建角色','system','2026-02-08 06:47:20.477294','2026-02-08 08:07:05.000000'),(7,'role:update','更新角色','system','2026-02-08 06:47:20.478882','2026-02-08 08:07:05.000000'),(8,'role:delete','删除角色','system','2026-02-08 06:47:20.480513','2026-02-08 08:07:05.000000'),(9,'app:read','查看应用列表','app','2026-02-08 07:33:00.066851','2026-02-08 07:33:00.066851'),(10,'app:create','创建应用','app','2026-02-08 07:33:00.072210','2026-02-08 07:33:00.072210'),(11,'app:update','更新应用','app','2026-02-08 07:33:00.075463','2026-02-08 07:33:00.075463'),(12,'app:delete','删除应用','app','2026-02-08 07:33:00.077898','2026-02-08 07:33:00.077898'),(13,'card:read','查看卡密列表','card','2026-02-08 07:33:00.079706','2026-02-08 07:33:00.079706'),(14,'card:create','创建卡密','card','2026-02-08 07:33:00.081490','2026-02-08 07:33:00.081490'),(15,'card:generate','批量生成卡密','card','2026-02-08 07:33:00.083435','2026-02-08 07:33:00.083435'),(16,'card:update','更新卡密','card','2026-02-08 07:33:00.085101','2026-02-08 07:33:00.085101'),(17,'card:delete','删除卡密','card','2026-02-08 07:33:00.087027','2026-02-08 07:33:00.087027'),(18,'agent:read','查看代理商','agent','2026-02-08 07:33:00.089296','2026-02-08 07:33:00.089296'),(19,'agent:create','创建代理商','agent','2026-02-08 07:33:00.091112','2026-02-08 07:33:00.091112'),(20,'agent:update','更新代理商','agent','2026-02-08 07:33:00.092601','2026-02-08 07:33:00.092601'),(21,'agent:delete','删除代理商','agent','2026-02-08 07:33:00.094218','2026-02-08 07:33:00.094218'),(22,'agent:dashboard','访问代理商仪表盘','agent','2026-02-08 07:33:00.095720','2026-02-08 07:33:00.095720'),(23,'end-user:read','查看终端用户','end-user','2026-02-08 07:33:00.097322','2026-02-08 07:33:00.097322'),(24,'end-user:create','创建终端用户','end-user','2026-02-08 07:33:00.098761','2026-02-08 07:33:00.098761'),(25,'end-user:update','更新终端用户','end-user','2026-02-08 07:33:00.101140','2026-02-08 07:33:00.101140'),(26,'end-user:delete','删除终端用户','end-user','2026-02-08 07:33:00.102650','2026-02-08 07:33:00.102650'),(27,'device:read','查看设备列表','device','2026-02-08 07:33:00.104330','2026-02-08 07:33:00.104330'),(28,'device:update','更新设备','device','2026-02-08 07:33:00.105747','2026-02-08 07:33:00.105747'),(29,'device:ban','封禁/解封设备','device','2026-02-08 07:33:00.107195','2026-02-08 07:33:00.107195'),(30,'device:delete','删除设备','device','2026-02-08 07:33:00.108792','2026-02-08 07:33:00.108792'),(31,'cloud:read','查看云函数','cloud','2026-02-08 07:33:00.110630','2026-02-08 07:33:00.110630'),(32,'cloud:create','创建云函数','cloud','2026-02-08 07:33:00.112030','2026-02-08 07:33:00.112030'),(33,'cloud:update','更新云函数','cloud','2026-02-08 07:33:00.113590','2026-02-08 07:33:00.113590'),(34,'cloud:delete','删除云函数','cloud','2026-02-08 07:33:00.115063','2026-02-08 07:33:00.115063'),(35,'cloud:execute','执行云函数','cloud','2026-02-08 07:33:00.116627','2026-02-08 07:33:00.116627'),(36,'variable:read','查看远程变量','variable','2026-02-08 07:33:00.118177','2026-02-08 07:33:00.118177'),(37,'variable:create','创建远程变量','variable','2026-02-08 07:33:00.119546','2026-02-08 07:33:00.119546'),(38,'variable:update','更新远程变量','variable','2026-02-08 07:33:00.121274','2026-02-08 07:33:00.121274'),(39,'variable:delete','删除远程变量','variable','2026-02-08 07:33:00.122653','2026-02-08 07:33:00.122653'),(40,'stats:read','查看统计数据','stats','2026-02-08 07:33:00.124138','2026-02-08 07:33:00.124138'),(41,'stats:dashboard','访问仪表盘','stats','2026-02-08 07:33:00.125518','2026-02-08 07:33:00.125518');
/*!40000 ALTER TABLE `access_control_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `access_control_role_permissions`
--

DROP TABLE IF EXISTS `access_control_role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_control_role_permissions` (
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `IDX_5767f9ca07c2acd1ae1f12e811` (`role_id`),
  KEY `IDX_a2086f61fb5f75170526eeb217` (`permission_id`),
  CONSTRAINT `FK_5767f9ca07c2acd1ae1f12e8116` FOREIGN KEY (`role_id`) REFERENCES `access_control_roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_a2086f61fb5f75170526eeb2178` FOREIGN KEY (`permission_id`) REFERENCES `access_control_permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_control_role_permissions`
--

LOCK TABLES `access_control_role_permissions` WRITE;
/*!40000 ALTER TABLE `access_control_role_permissions` DISABLE KEYS */;
INSERT INTO `access_control_role_permissions` VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),(1,11),(1,12),(1,13),(1,14),(1,15),(1,16),(1,17),(1,18),(1,19),(1,20),(1,21),(1,22),(1,23),(1,24),(1,25),(1,26),(1,27),(1,28),(1,29),(1,30),(1,31),(1,32),(1,33),(1,34),(1,35),(1,36),(1,37),(1,38),(1,39),(1,40),(1,41),(2,1),(2,2),(2,3),(2,4),(2,9),(2,10),(2,11),(2,12),(2,13),(2,14),(2,15),(2,16),(2,17),(2,23),(2,24),(2,25),(2,26),(2,27),(2,28),(2,29),(2,30),(2,31),(2,32),(2,33),(2,34),(2,35),(2,36),(2,37),(2,38),(2,39),(2,40),(2,41),(3,13),(3,14),(3,15),(3,22),(3,23),(3,41);
/*!40000 ALTER TABLE `access_control_role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `access_control_roles`
--

DROP TABLE IF EXISTS `access_control_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_control_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_system` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_951b3c684e390dd1836a6d9037` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_control_roles`
--

LOCK TABLES `access_control_roles` WRITE;
/*!40000 ALTER TABLE `access_control_roles` DISABLE KEYS */;
INSERT INTO `access_control_roles` VALUES (1,'Super Admin','System Administrator with full access',1,'2026-02-08 06:47:20.484292','2026-02-08 06:47:20.484292'),(2,'Developer','软件开发者，管理应用、卡密、用户和云函数',1,'2026-02-08 07:33:00.134922','2026-02-08 07:33:00.134922'),(3,'Agent','代理商，卡密销售和用户查看',1,'2026-02-08 07:33:00.137956','2026-02-08 07:33:00.137956');
/*!40000 ALTER TABLE `access_control_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','developer','agent') NOT NULL DEFAULT 'developer',
  `agent_level` int NOT NULL DEFAULT '0',
  `parent_id` bigint DEFAULT NULL,
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `points` bigint NOT NULL DEFAULT '0',
  `email` varchar(255) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `role_id` int DEFAULT NULL,
  `is_totp_enabled` tinyint NOT NULL DEFAULT '0',
  `totp_secret` varchar(255) DEFAULT NULL,
  `expire_at` timestamp NULL DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_4ba6d0c734d53f8e1b2e24b6c5` (`username`),
  KEY `FK_5733c73cd81c566a90cc4802f96` (`role_id`),
  CONSTRAINT `FK_5733c73cd81c566a90cc4802f96` FOREIGN KEY (`role_id`) REFERENCES `access_control_roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (5,'admin','$2b$10$VFHzBAvq5AJG2qH4WT7uiOvrFLUOdEzLNI.HOXnaSKbMjIR1KsSZ6','admin',0,NULL,9999.00,0,NULL,1,'2026-02-08 04:41:51.706409','2026-02-08 07:38:27.000000',1,0,NULL,NULL,NULL),(6,'idouqq','$2b$10$OB6V2rQlNpnPU/0mzibA4eUPnCU3.BpS/z.C9NNn7dDxmWVwMBJAa','developer',0,NULL,0.00,0,'',1,'2026-02-08 04:44:17.875775','2026-02-10 08:04:52.000000',2,0,NULL,NULL,NULL),(7,'daili','','agent',0,NULL,2000.00,0,'',1,'2026-02-08 04:44:17.939352','2026-02-10 08:05:04.000000',3,0,NULL,NULL,NULL),(9,'daili2','$2b$10$Rh0axMfFd07RH3z44fQPyORCkanYpEI/o5bPlVfHiBr/anOSMXIVK','agent',0,6,2000.00,0,'',1,'2026-02-10 08:05:31.064883','2026-02-10 14:01:54.000000',3,0,NULL,NULL,NULL),(10,'test_dev_01','$2b$10$Ap4alhr.Iw4HquuuhE8mLOdFf5QecwuKsPO4QKHt3fnrj6KJkJ4kS','developer',0,NULL,0.00,0,NULL,1,'2026-02-10 08:17:20.951602','2026-02-10 08:17:20.951602',2,0,NULL,NULL,NULL),(11,'test_agent_01','','agent',0,10,0.00,0,'',0,'2026-02-10 08:17:21.143127','2026-02-12 20:37:27.000000',3,0,NULL,'2026-02-11 00:00:07','4');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agent`
--

DROP TABLE IF EXISTS `agent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level` int NOT NULL DEFAULT '1',
  `discount_rate` decimal(5,2) NOT NULL DEFAULT '100.00',
  `can_manage_sub_agents` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_031462988904ed291dd85171a8` (`user_id`),
  CONSTRAINT `FK_031462988904ed291dd85171a86` FOREIGN KEY (`user_id`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agent`
--

LOCK TABLES `agent` WRITE;
/*!40000 ALTER TABLE `agent` DISABLE KEYS */;
INSERT INTO `agent` VALUES (1,1,100.00,1,'2026-02-11 14:07:53.406578','2026-02-12 20:37:27.000000',11);
/*!40000 ALTER TABLE `agent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app`
--

DROP TABLE IF EXISTS `app`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `app_secret` varchar(255) NOT NULL,
  `version` varchar(255) NOT NULL DEFAULT '1.0.0',
  `download_url` varchar(255) DEFAULT NULL,
  `heart_interval` int NOT NULL DEFAULT '60',
  `force_update` tinyint NOT NULL DEFAULT '0',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `creator_id` int DEFAULT NULL,
  `trial_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `trial_duration` int NOT NULL DEFAULT '86400',
  `trial_device_limit` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_7496a1d967505390d981dd867a` (`app_secret`),
  KEY `FK_19b8c8ca9eaab683828fef962cf` (`creator_id`),
  CONSTRAINT `FK_19b8c8ca9eaab683828fef962cf` FOREIGN KEY (`creator_id`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app`
--

LOCK TABLES `app` WRITE;
/*!40000 ALTER TABLE `app` DISABLE KEYS */;
INSERT INTO `app` VALUES (1,'TestApp','secret123','1.0.0',NULL,60,0,1,'2026-02-07 14:00:26.049585','2026-02-07 14:00:26.049585',NULL,0,86400,1),(2,'MyNewApp','rUjfbqElsw1kI4wzY7i8WqgmFzUqC5bd','1.0.0','',60,0,1,'2026-02-07 16:10:43.243564','2026-02-07 16:10:43.243564',NULL,0,86400,1),(3,'TestApp_1770560064445','9e2717e14d13e0f0f585607cdb85cd8f','1.0.0','',60,0,1,'2026-02-08 14:14:24.446421','2026-02-12 20:36:05.000000',NULL,1,86400,1),(4,'开发者测试应用','g1I7QDc4Jy2uy1ohVvC748o6HYPTbQKf','1.0.0','',60,0,1,'2026-02-11 02:06:40.627965','2026-02-11 02:06:40.627965',6,0,86400,1),(5,'22','ALTzGhCo8AWrZMlHp1TLV8IOGsfvaFGl','1.0.0','',60,0,1,'2026-02-11 14:18:31.802906','2026-02-11 14:18:31.802906',5,0,86400,1),(6,'TimeTestApp','SrJ799RdAu9DCrp9HxUVWZsp9Pf5w5Hs','1.0.0','',60,0,1,'2026-02-11 14:42:50.647610','2026-02-11 14:42:50.647610',5,0,86400,1),(7,'777','YMWln933uEHY295Omb0o8B9pkN8wedFM','1.0.0','',60,0,1,'2026-02-12 20:30:32.979396','2026-02-12 20:50:49.000000',5,0,86400,1);
/*!40000 ALTER TABLE `app` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `balance_logs`
--

DROP TABLE IF EXISTS `balance_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `balance_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `operator_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('admin_adjust','card_generation') NOT NULL DEFAULT 'admin_adjust',
  `description` text,
  `balance_after` decimal(10,2) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_16cddcf151cdeeb3d28285ef09e` (`user_id`),
  KEY `FK_8d718d3698cbe4f7add9390b0b7` (`operator_id`),
  CONSTRAINT `FK_16cddcf151cdeeb3d28285ef09e` FOREIGN KEY (`user_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_8d718d3698cbe4f7add9390b0b7` FOREIGN KEY (`operator_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `balance_logs`
--

LOCK TABLES `balance_logs` WRITE;
/*!40000 ALTER TABLE `balance_logs` DISABLE KEYS */;
INSERT INTO `balance_logs` VALUES (1,7,5,1000.00,'admin_adjust','管理员/系统 调整余额',2000.00,'2026-02-09 03:31:35.680943'),(2,9,6,2000.00,'admin_adjust','管理员/系统 调整余额',2000.00,'2026-02-10 14:01:21.307403');
/*!40000 ALTER TABLE `balance_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blacklists`
--

DROP TABLE IF EXISTS `blacklists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blacklists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('IP','HWID') NOT NULL,
  `value` varchar(255) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `expired_at` datetime DEFAULT NULL,
  `operator_id` int DEFAULT NULL,
  `operator_username` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_0d2a72917cef54ef90fdec73f9` (`type`),
  KEY `IDX_9b8865dfd8af1ac90d3010d758` (`value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blacklists`
--

LOCK TABLES `blacklists` WRITE;
/*!40000 ALTER TABLE `blacklists` DISABLE KEYS */;
/*!40000 ALTER TABLE `blacklists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `card`
--

DROP TABLE IF EXISTS `card`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `value` int NOT NULL,
  `status` enum('unused','used','banned','expired') NOT NULL DEFAULT 'unused',
  `app_id` int DEFAULT NULL,
  `creator_id` int DEFAULT NULL,
  `used_by_id` int DEFAULT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `used_by` int DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'time',
  `device_limit` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_15738a63c09ba64fdcae4b67f2` (`code`),
  KEY `FK_3b776882affc278a93857aa85c3` (`app_id`),
  KEY `FK_176eef9fd3d2203bb77cc8a7d51` (`creator_id`),
  KEY `FK_eb798395e7e25cc66db3395c0e1` (`used_by`),
  CONSTRAINT `FK_176eef9fd3d2203bb77cc8a7d51` FOREIGN KEY (`creator_id`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_3b776882affc278a93857aa85c3` FOREIGN KEY (`app_id`) REFERENCES `app` (`id`),
  CONSTRAINT `FK_eb798395e7e25cc66db3395c0e1` FOREIGN KEY (`used_by`) REFERENCES `end_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card`
--

LOCK TABLES `card` WRITE;
/*!40000 ALTER TABLE `card` DISABLE KEYS */;
INSERT INTO `card` VALUES (1,'56b1f700-2432-4880-860c-7798f09095b3',86400,'unused',1,NULL,NULL,NULL,'2026-02-07 14:00:41.321546',NULL,NULL,'time',1),(2,'eee87907-0955-473c-a517-ad98d38e3e25',86400,'unused',1,NULL,NULL,NULL,'2026-02-07 14:00:41.324794',NULL,NULL,'time',1),(3,'90be4b4f-e6a2-4daa-83be-a4dce8ae1d49',86400,'unused',2,NULL,NULL,NULL,'2026-02-07 16:15:50.573719',NULL,NULL,'time',1),(4,'99570fe0-ff4d-49e4-bf64-a00c594b2167',86400,'unused',2,NULL,NULL,NULL,'2026-02-07 16:15:50.604178',NULL,NULL,'time',1),(5,'9da2a903-d13a-4aa8-8f90-ec54c441e7ac',86400,'unused',2,NULL,NULL,NULL,'2026-02-07 16:15:50.607282',NULL,NULL,'time',1),(6,'b76de5d3-23cd-476f-a804-9fe31a8f7ee4',86400,'unused',2,NULL,NULL,NULL,'2026-02-07 16:15:50.608711',NULL,NULL,'time',1),(7,'a25964b1-c4a9-4fd2-bf0c-e86a06f82c7e',86400,'unused',2,NULL,NULL,NULL,'2026-02-07 16:15:50.612808',NULL,NULL,'time',1),(8,'6ac86704-2f7d-4a72-95e0-bb41fa591a80',86400,'unused',2,NULL,NULL,NULL,'2026-02-07 16:15:50.614370',NULL,NULL,'time',1),(9,'0157daf1-b92e-4457-ac66-0a4ff908a91b',86400,'unused',2,NULL,NULL,NULL,'2026-02-07 16:15:50.615605',NULL,NULL,'time',1),(10,'86eb6f75-fecc-4fa8-b55a-0a1450905b3b',86400,'unused',2,NULL,NULL,NULL,'2026-02-07 16:15:50.616471',NULL,NULL,'time',1),(11,'d1169a0c-4bda-4cbe-845c-763e10efdd0c',86400,'unused',2,NULL,NULL,NULL,'2026-02-07 16:15:50.617365',NULL,NULL,'time',1),(12,'39b40e8e-0406-4265-bebd-0c8f2d90706e',86400,'unused',2,NULL,NULL,NULL,'2026-02-07 16:15:50.618215',NULL,NULL,'time',1),(13,'0ecdea2d-59f7-4b86-8735-4ad43d6fcc7f',259200,'unused',1,NULL,NULL,NULL,'2026-02-09 05:20:34.551758',NULL,'Test Card','time',1),(14,'f7e38858-2cc3-49b2-a2a9-d9aa370a6931',259200,'unused',1,NULL,NULL,NULL,'2026-02-09 05:21:08.937055',NULL,'Test Card','time',1),(15,'a20d8189-25b2-424c-b543-a7afe97873ff',259200,'used',1,NULL,NULL,'2026-02-09 13:25:08','2026-02-09 05:25:07.702693',1,'Test Card','time',1),(16,'2f31db4c-fbf2-448e-944f-48f341782e00',86400,'used',1,NULL,NULL,'2026-02-09 13:47:58','2026-02-09 05:47:47.915372',2,NULL,'time',2),(17,'8d5a27d8-4e07-4dea-8e15-c49177cf0245',86400,'used',1,NULL,NULL,'2026-02-09 13:48:18','2026-02-09 05:48:17.711219',3,NULL,'time',1),(18,'2a6d98ab-9df7-4698-b432-c32401088ff6',86400,'used',1,NULL,NULL,'2026-02-09 13:48:18','2026-02-09 05:48:17.749436',4,NULL,'time',1),(19,'f9597565-855e-4f6a-bae9-574e3e156f82',259200,'unused',3,NULL,NULL,NULL,'2026-02-09 05:50:16.013689',NULL,'','time',2),(20,'2b633414-f7b9-49ec-8346-462418e6e9cd',259200,'unused',3,NULL,NULL,NULL,'2026-02-09 05:50:16.017124',NULL,'','time',2),(21,'9391c4de-7141-4f22-961b-ca6a22dff669',259200,'unused',3,NULL,NULL,NULL,'2026-02-09 05:50:16.019055',NULL,'','time',2),(22,'68a58f19-80fe-4e7c-84e9-ab54ad4cad34',259200,'unused',3,NULL,NULL,NULL,'2026-02-09 05:50:16.020798',NULL,'','time',2),(23,'f5ded70b-20fd-4406-8666-c37025d4d8ad',259200,'unused',3,NULL,NULL,NULL,'2026-02-09 05:50:16.023395',NULL,'','time',2),(24,'73630835-1a79-41cc-b9a7-094eae751afb',259200,'unused',3,NULL,NULL,NULL,'2026-02-09 05:50:16.025832',NULL,'','time',2),(25,'83faac60-7eb1-421e-8154-248c3c243491',259200,'unused',3,NULL,NULL,NULL,'2026-02-09 05:50:16.028046',NULL,'','time',2),(26,'1190ad96-fc0a-4624-b498-718b40c932ba',259200,'unused',3,NULL,NULL,NULL,'2026-02-09 05:50:16.030765',NULL,'','time',2),(27,'f1371cdd-eca1-45e4-b568-da8c5fe3966a',259200,'unused',3,NULL,NULL,NULL,'2026-02-09 05:50:16.033169',NULL,'','time',2),(28,'f9be9985-f36c-41a7-8749-d7520e22f178',259200,'unused',3,NULL,NULL,NULL,'2026-02-09 05:50:16.035251',NULL,'','time',2),(29,'JX274XZRJP',86400,'unused',1,NULL,NULL,NULL,'2026-02-09 05:53:59.539156',NULL,NULL,'time',1),(30,'DZV7UC64ZD',86400,'unused',1,NULL,NULL,NULL,'2026-02-09 05:53:59.542776',NULL,NULL,'time',1),(31,'9EJSQZZZ47',86400,'unused',1,NULL,NULL,NULL,'2026-02-09 05:53:59.544776',NULL,NULL,'time',1),(33,'VBDZKJ9N2B',259200,'unused',3,NULL,NULL,NULL,'2026-02-09 05:54:46.244683',NULL,'','time',1),(34,'HTPQYAHRKK',259200,'unused',1,NULL,NULL,NULL,'2026-02-09 05:55:11.725441',NULL,'222','time',1),(35,'99JBST8WEV',259200,'unused',1,NULL,NULL,NULL,'2026-02-09 05:55:11.734712',NULL,'222','time',1),(36,'ZF8MZASXXS',2592000,'banned',4,6,NULL,NULL,'2026-02-11 02:07:34.513706',NULL,'测试备注','time',2),(37,'Y9CDMTX5CF',2592000,'unused',4,6,NULL,NULL,'2026-02-11 12:32:40.294855',NULL,'22','time',1),(39,'FFD757YJZY',2592000,'unused',4,5,NULL,NULL,'2026-02-11 14:03:20.007406',NULL,'','time',1),(40,'K5YTJKQEUD',2592000,'unused',4,5,NULL,NULL,'2026-02-11 14:05:01.123786',NULL,'额','time',1),(41,'X5JRRPAFSD',259200,'unused',5,5,NULL,NULL,'2026-02-11 22:39:30.483355',NULL,'的','time',1),(42,'W6V57CWKDC',2592000,'unused',4,5,NULL,NULL,'2026-02-12 21:15:50.201731',NULL,'','time',1);
/*!40000 ALTER TABLE `card` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `card_type`
--

DROP TABLE IF EXISTS `card_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `value` int NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `app_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `device_limit` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_139b6b69c48272c09ef5bd29e12` (`app_id`),
  CONSTRAINT `FK_139b6b69c48272c09ef5bd29e12` FOREIGN KEY (`app_id`) REFERENCES `app` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card_type`
--

LOCK TABLES `card_type` WRITE;
/*!40000 ALTER TABLE `card_type` DISABLE KEYS */;
INSERT INTO `card_type` VALUES (1,'月卡',2592000,1.00,4,'2026-02-11 02:07:05.503623','2026-02-11 14:03:03.000000',1),(2,'111',259200,2.00,4,'2026-02-11 12:54:39.726395','2026-02-11 12:54:39.726395',1),(6,'522',259200,0.00,5,'2026-02-11 14:18:55.387228','2026-02-11 14:18:55.387228',1),(8,'1',259200,0.00,5,'2026-02-11 14:32:09.348101','2026-02-11 14:32:09.348101',1),(9,'的',86400,0.00,5,'2026-02-11 22:39:15.889530','2026-02-11 22:39:15.889530',1);
/*!40000 ALTER TABLE `card_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cloud_function`
--

DROP TABLE IF EXISTS `cloud_function`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cloud_function` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trigger_name` varchar(255) NOT NULL,
  `code` text NOT NULL,
  `app_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_19749b1f1246da64977a206baa2` (`app_id`),
  CONSTRAINT `FK_19749b1f1246da64977a206baa2` FOREIGN KEY (`app_id`) REFERENCES `app` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cloud_function`
--

LOCK TABLES `cloud_function` WRITE;
/*!40000 ALTER TABLE `cloud_function` DISABLE KEYS */;
INSERT INTO `cloud_function` VALUES (1,'GetOffset','return 0x12345678;',1,'2026-02-07 14:00:42.414705','2026-02-07 14:00:42.414705'),(2,'GetValue','var x = 123; return x * 2;',1,'2026-02-07 14:03:23.938612','2026-02-07 14:03:23.938612'),(3,'fff','return 1',1,'2026-02-11 14:40:09.838854','2026-02-11 14:40:09.838854'),(4,'ddddd','re',1,'2026-02-11 23:01:35.685600','2026-02-12 20:37:10.000000');
/*!40000 ALTER TABLE `cloud_function` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device`
--

DROP TABLE IF EXISTS `device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hwid` varchar(255) NOT NULL,
  `cpu_id` varchar(255) DEFAULT NULL,
  `disk_serial` varchar(255) DEFAULT NULL,
  `mac_address` varchar(255) DEFAULT NULL,
  `bios_uuid` varchar(255) DEFAULT NULL,
  `last_ip` varchar(255) DEFAULT NULL,
  `is_banned` tinyint NOT NULL DEFAULT '0',
  `ban_reason` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `device_name` varchar(255) DEFAULT NULL,
  `end_user_id` int DEFAULT NULL,
  `app_id` int DEFAULT NULL,
  `last_heartbeat` datetime DEFAULT NULL,
  `status` enum('online','offline','banned') NOT NULL DEFAULT 'offline',
  `app_version` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_73ae631a638a68b5f35ab8a543` (`hwid`),
  KEY `FK_5d8bf38ee70069ec7a01cf5f19f` (`app_id`),
  KEY `FK_42ae54e4ea729e75430e0f10428` (`end_user_id`),
  CONSTRAINT `FK_42ae54e4ea729e75430e0f10428` FOREIGN KEY (`end_user_id`) REFERENCES `end_users` (`id`),
  CONSTRAINT `FK_5d8bf38ee70069ec7a01cf5f19f` FOREIGN KEY (`app_id`) REFERENCES `app` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device`
--

LOCK TABLES `device` WRITE;
/*!40000 ALTER TABLE `device` DISABLE KEYS */;
INSERT INTO `device` VALUES (1,'test-device-001',NULL,NULL,NULL,NULL,'::1',0,NULL,'2026-02-08 01:10:36.291290','2026-02-09 05:47:58.000000',NULL,2,1,'2026-02-08 09:10:36','online',NULL),(2,'test-hwid-123',NULL,NULL,NULL,NULL,'::1',0,NULL,'2026-02-08 14:14:24.456651','2026-02-08 14:14:24.456651',NULL,NULL,3,'2026-02-08 22:14:24','online',NULL),(3,'single-device-001',NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-02-09 05:48:17.732709','2026-02-09 05:48:17.732709',NULL,3,1,NULL,'offline',NULL),(4,'single-device-002',NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-02-09 05:48:17.767366','2026-02-09 05:48:17.767366',NULL,4,1,NULL,'offline',NULL);
/*!40000 ALTER TABLE `device` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `end_users`
--

DROP TABLE IF EXISTS `end_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `end_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `hwid` varchar(255) DEFAULT NULL,
  `app_id` int DEFAULT NULL,
  `agent_id` bigint DEFAULT NULL,
  `expire_time` datetime DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `last_ip` varchar(255) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `max_devices` int NOT NULL DEFAULT '1',
  `has_used_trial` tinyint NOT NULL DEFAULT '0',
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_b5af5aeab3838b288742ba13d91` (`app_id`),
  CONSTRAINT `FK_b5af5aeab3838b288742ba13d91` FOREIGN KEY (`app_id`) REFERENCES `app` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `end_users`
--

LOCK TABLES `end_users` WRITE;
/*!40000 ALTER TABLE `end_users` DISABLE KEYS */;
INSERT INTO `end_users` VALUES (1,NULL,'test-hwid-1770614707',1,NULL,'2026-02-12 13:25:08',1,NULL,NULL,'2026-02-09 05:25:07.723998','2026-02-09 05:25:07.000000',1,0,NULL),(2,NULL,'test-device-001',1,NULL,'2026-02-10 13:47:58',1,NULL,NULL,'2026-02-09 05:47:58.468240','2026-02-09 05:47:58.000000',2,0,NULL),(3,NULL,'single-device-001',1,NULL,'2026-02-10 13:48:18',1,NULL,NULL,'2026-02-09 05:48:17.728075','2026-02-09 05:48:17.000000',1,0,NULL),(4,NULL,NULL,1,NULL,'2026-02-10 13:48:18',1,NULL,NULL,'2026-02-09 05:48:17.763720','2026-02-09 05:51:56.000000',1,0,NULL),(5,'test_user_001',NULL,1,NULL,NULL,1,NULL,'2026-02-12 22:24:34','2026-02-12 22:24:34.365716','2026-02-12 22:24:34.000000',1,0,'$2b$10$77eb8bSUnQajXgywOQLpeuUJ8j3mtKzvy2lpUl.1Z0dYHzp75a5gq');
/*!40000 ALTER TABLE `end_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operation_logs`
--

DROP TABLE IF EXISTS `operation_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operation_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int DEFAULT NULL,
  `admin_username` varchar(255) DEFAULT NULL,
  `method` enum('GET','POST','PUT','DELETE','PATCH','OPTIONS','HEAD') NOT NULL,
  `path` varchar(255) NOT NULL,
  `query` text,
  `body` text,
  `ip` varchar(255) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `status_code` int NOT NULL DEFAULT '200',
  `execution_time` int DEFAULT NULL,
  `error_message` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_7ea40e2d7379a1ea83af2f00c5` (`admin_id`),
  KEY `IDX_4b5947763b1f5e3e33942ab5b7` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operation_logs`
--

LOCK TABLES `operation_logs` WRITE;
/*!40000 ALTER TABLE `operation_logs` DISABLE KEYS */;
INSERT INTO `operation_logs` VALUES (1,6,'idouqq','POST','/api/auth/login','{}','{\"username\":\"idouqq\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,6,NULL,'2026-02-10 13:46:58.419184'),(2,NULL,'idouqq','PUT','/api/users/9','{}','{\"username\":\"daili2\",\"email\":\"\",\"password\":\"\",\"role\":\"agent\",\"balance\":2000,\"is_active\":true}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,49,NULL,'2026-02-10 14:01:21.321578'),(3,6,'idouqq','POST','/api/auth/login','{}','{\"username\":\"idouqq\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,0,NULL,'2026-02-10 14:01:44.564142'),(4,NULL,'idouqq','PUT','/api/users/9','{}','{\"username\":\"daili2\",\"email\":\"\",\"password\":\"******\",\"role\":\"agent\",\"balance\":2000,\"is_active\":true}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,103,NULL,'2026-02-10 14:01:54.656041'),(5,9,'daili2','POST','/api/auth/login','{}','{\"username\":\"daili2\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,0,NULL,'2026-02-10 14:02:04.814448'),(6,9,'daili2','POST','/api/auth/login','{}','{\"username\":\"daili2\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,3,NULL,'2026-02-10 14:20:36.415119'),(7,6,'idouqq','POST','/api/auth/login','{}','{\"username\":\"idouqq\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,1,NULL,'2026-02-10 14:20:59.193259'),(8,NULL,NULL,'POST','/api/users/public-register','{}','{\"username\":\"agent_test\",\"password\":\"******\",\"registerType\":\"agent\"}','::1','curl/8.7.1',400,58,'代理商注册必须提供开发者账号','2026-02-10 14:37:35.526237'),(9,6,'idouqq','POST','/api/auth/login','{}','{\"username\":\"idouqq\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,4,NULL,'2026-02-10 14:38:21.868228'),(10,6,'idouqq','POST','/api/auth/login','{}','{\"username\":\"idouqq\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,1,NULL,'2026-02-10 14:50:43.854030'),(11,6,'idouqq','POST','/api/auth/login','{}','{\"username\":\"idouqq\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,0,NULL,'2026-02-10 14:50:53.346919'),(12,6,'idouqq','POST','/api/auth/login','{}','{\"username\":\"idouqq\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,0,NULL,'2026-02-10 14:51:00.299588'),(13,6,'idouqq','POST','/api/auth/login','{}','{\"username\":\"idouqq\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,1,NULL,'2026-02-10 14:58:24.952282'),(14,6,'idouqq','POST','/api/auth/login','{}','{\"username\":\"idouqq\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,0,NULL,'2026-02-10 14:59:37.430312'),(15,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,1,NULL,'2026-02-10 15:58:23.537048'),(16,6,'idouqq','POST','/api/auth/login','{}','{\"username\":\"idouqq\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,1,NULL,'2026-02-10 16:02:59.442178'),(17,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,0,NULL,'2026-02-10 16:03:33.613968'),(18,6,'idouqq','POST','/api/auth/login','{}','{\"username\":\"idouqq\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,1,NULL,'2026-02-11 00:39:09.994527'),(19,6,'idouqq','POST','/api/apps','{}','{\"name\":\"开发者测试应用\",\"app_secret\":\"g1I7QDc4Jy2uy1ohVvC748o6HYPTbQKf\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,17,NULL,'2026-02-11 02:06:40.640525'),(20,6,'idouqq','POST','/api/card-types','{}','{\"name\":\"月卡\",\"app_id\":4,\"value\":2592000,\"price\":200}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,13,NULL,'2026-02-11 02:07:05.521394'),(21,6,'idouqq','POST','/api/cards/generate','{}','{\"value\":24,\"app_id\":4,\"count\":1,\"remark\":\"测试备注\",\"device_limit\":2,\"card_type_id\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,17,NULL,'2026-02-11 02:07:34.522514'),(22,NULL,NULL,'PUT','/api/cards/36/ban','{}','{}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,31,NULL,'2026-02-11 12:27:45.913527'),(23,6,'idouqq','POST','/api/cards/generate','{}','{\"value\":24,\"app_id\":4,\"count\":1,\"remark\":\"22\",\"device_limit\":1,\"card_type_id\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,34,NULL,'2026-02-11 12:32:40.313713'),(24,5,'admin','POST','/api/agents/cards/generate','{}','{\"type\":\"activate\",\"value\":86400,\"app_id\":1,\"count\":10}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',403,8,'非代理商账户','2026-02-11 12:35:38.409833'),(25,5,'admin','POST','/api/agents/cards/generate','{}','{\"type\":\"recharge\",\"value\":86400,\"app_id\":1,\"count\":10}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',403,3,'非代理商账户','2026-02-11 12:35:42.362181'),(26,6,'idouqq','POST','/api/card-types','{}','{\"name\":\"111\",\"app_id\":4,\"value\":259200,\"price\":2}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,17,NULL,'2026-02-11 12:54:39.743343'),(27,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,2,NULL,'2026-02-11 13:05:49.980107'),(28,NULL,NULL,'PUT','/api/cards/36/unban','{}','{}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,25,NULL,'2026-02-11 13:12:39.690429'),(29,NULL,NULL,'PUT','/api/cards/36/ban','{}','{}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,13,NULL,'2026-02-11 13:12:41.699655'),(30,5,'admin','PATCH','/api/card-types/1','{}','{\"name\":\"月卡\",\"app_id\":4,\"value\":2592000,\"price\":1,\"device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,12,NULL,'2026-02-11 14:03:03.397701'),(31,5,'admin','POST','/api/cards/generate','{}','{\"value\":24,\"app_id\":4,\"count\":1,\"remark\":\"\",\"card_type_id\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,27,NULL,'2026-02-11 14:03:20.019782'),(32,5,'admin','POST','/api/cards/generate','{}','{\"value\":24,\"app_id\":4,\"count\":1,\"remark\":\"额\",\"card_type_id\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,30,NULL,'2026-02-11 14:05:01.139428'),(33,5,'admin','PUT','/api/users/11','{}','{\"username\":\"test_agent_01\",\"email\":\"\",\"password\":\"\",\"role\":\"agent\",\"balance\":0,\"is_active\":false,\"expire_at\":\"2026-02-11 00:00:07\",\"remark\":null,\"level\":1,\"discount_rate\":100}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,49,NULL,'2026-02-11 14:07:53.414071'),(34,5,'admin','POST','/api/card-types','{}','{\"name\":\"22\",\"app_id\":4,\"value\":259200,\"price\":1,\"device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,19,NULL,'2026-02-11 14:12:47.177739'),(35,5,'admin','POST','/api/apps','{}','{\"name\":\"22\",\"app_secret\":\"ALTzGhCo8AWrZMlHp1TLV8IOGsfvaFGl\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,31,NULL,'2026-02-11 14:18:31.819212'),(36,5,'admin','POST','/api/card-types','{}','{\"name\":\"522\",\"app_id\":5,\"value\":259200,\"price\":0,\"device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,15,NULL,'2026-02-11 14:18:55.401028'),(37,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,4,NULL,'2026-02-11 14:26:58.044102'),(38,5,'admin','POST','/api/card-types','{}','{\"name\":\"等等\",\"app_id\":5,\"value\":259200,\"price\":1,\"device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,12,NULL,'2026-02-11 14:27:09.498036'),(39,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,5,NULL,'2026-02-11 14:32:01.106331'),(40,5,'admin','POST','/api/card-types','{}','{\"name\":\"1\",\"app_id\":5,\"value\":259200,\"price\":0,\"device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,14,NULL,'2026-02-11 14:32:09.361867'),(41,5,'admin','DELETE','/api/card-types/7','{}','{}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,13,NULL,'2026-02-11 14:32:16.797341'),(42,5,'admin','DELETE','/api/card-types/5','{}','{}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,10,NULL,'2026-02-11 14:32:18.214870'),(43,5,'admin','POST','/api/card-types','{}','{\"name\":\"的\",\"app_id\":5,\"value\":86400,\"price\":0,\"device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,14,NULL,'2026-02-11 22:39:15.901746'),(44,5,'admin','POST','/api/cards/generate','{}','{\"value\":24,\"app_id\":5,\"count\":1,\"remark\":\"的\",\"card_type_id\":6}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,24,NULL,'2026-02-11 22:39:30.496118'),(45,NULL,NULL,'POST','/api/cloud/create','{}','{\"trigger_name\":\"fff\",\"code\":\"return 1\",\"app_id\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,15,NULL,'2026-02-11 14:40:09.852113'),(46,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,31,NULL,'2026-02-11 14:42:16.038686'),(47,5,'admin','POST','/api/apps','{}','{\"name\":\"TimeTestApp\",\"app_secret\":\"SrJ799RdAu9DCrp9HxUVWZsp9Pf5w5Hs\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,43,NULL,'2026-02-11 14:42:50.696658'),(48,NULL,NULL,'POST','/api/cloud/create','{}','{\"trigger_name\":\"ddddd\",\"code\":\"re\",\"app_id\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,22,NULL,'2026-02-11 23:01:35.702470'),(49,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',200,1,NULL,'2026-02-12 10:07:26.103001'),(50,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','',200,1,NULL,'2026-02-12 18:34:59.064398'),(51,NULL,NULL,'POST','/api/cards/redeem','{}','{\"code\":\"INVALID_CODE_12345\"}','::1','',500,0,'必须提供机器码(HWID)','2026-02-12 18:34:59.091919'),(52,5,'admin','POST','/api/auth/2fa/generate','{}','{}','::1','',500,0,'Cannot read properties of undefined (reading \'generateSecret\')','2026-02-12 18:34:59.117863'),(53,NULL,NULL,'POST','/api/cards/redeem','{}','{\"code\":\"INVALID_CODE_12345\"}','::1','curl/8.7.1',500,0,'必须提供机器码(HWID)','2026-02-12 18:35:40.701431'),(54,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','curl/8.7.1',200,2,NULL,'2026-02-12 18:44:07.056712'),(55,5,'admin','POST','/api/auth/2fa/generate','{}','{}','::1','curl/8.7.1',500,1,'Cannot read properties of undefined (reading \'generateSecret\')','2026-02-12 18:44:07.065938'),(56,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','',200,0,NULL,'2026-02-12 18:44:30.509854'),(57,NULL,NULL,'POST','/api/cards/redeem','{}','{\"code\":\"INVALID_CODE_12345\"}','::1','',500,0,'必须提供机器码(HWID)','2026-02-12 18:44:30.529729'),(58,5,'admin','POST','/api/auth/2fa/generate','{}','{}','::1','',500,0,'Cannot read properties of undefined (reading \'generateSecret\')','2026-02-12 10:44:30.546935'),(59,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',200,2,NULL,'2026-02-12 12:14:01.846601'),(60,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',200,1,NULL,'2026-02-12 20:16:22.174123'),(61,5,'admin','PUT','/api/apps/6','{}','{\"name\":\"TimeTestApp\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',500,3,'Property \"trial_enabled\" was not found in \"App\". Make sure your query is correct.','2026-02-12 20:16:43.697250'),(62,5,'admin','PUT','/api/apps/6','{}','{\"name\":\"TimeTestApp\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',500,4,'Property \"trial_enabled\" was not found in \"App\". Make sure your query is correct.','2026-02-12 20:16:47.631928'),(63,5,'admin','PUT','/api/apps/6','{}','{\"name\":\"TimeTestApp\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":false,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',500,0,'Property \"trial_enabled\" was not found in \"App\". Make sure your query is correct.','2026-02-12 20:16:56.165142'),(64,5,'admin','PUT','/api/apps/6','{}','{\"name\":\"TimeTestApp\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":true,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',500,1,'Property \"trial_enabled\" was not found in \"App\". Make sure your query is correct.','2026-02-12 20:21:02.741322'),(65,5,'admin','PUT','/api/apps/6','{}','{\"name\":\"TimeTestApp\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":true,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',500,2,'Property \"trial_enabled\" was not found in \"App\". Make sure your query is correct.','2026-02-12 20:21:25.307010'),(66,5,'admin','PUT','/api/apps/6','{}','{\"name\":\"TimeTestApp\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',500,1,'Property \"trial_enabled\" was not found in \"App\". Make sure your query is correct.','2026-02-12 20:21:38.801149'),(67,5,'admin','PUT','/api/apps/6','{}','{\"name\":\"TimeTestApp\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',500,8,'Property \"trial_enabled\" was not found in \"App\". Make sure your query is correct.','2026-02-12 20:23:00.913608'),(68,5,'admin','PUT','/api/apps/1','{}','{\"name\":\"TestApp\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',500,0,'Property \"trial_enabled\" was not found in \"App\". Make sure your query is correct.','2026-02-12 20:23:29.167699'),(69,5,'admin','PUT','/api/apps/2','{}','{\"name\":\"MyNewApp\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',500,1,'Property \"trial_enabled\" was not found in \"App\". Make sure your query is correct.','2026-02-12 20:27:16.414935'),(70,5,'admin','PUT','/api/apps/1','{}','{\"name\":\"TestApp\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',500,1,'Property \"trial_enabled\" was not found in \"App\". Make sure your query is correct.','2026-02-12 20:29:21.065934'),(71,5,'admin','POST','/api/apps','{}','{\"name\":\"777\",\"app_secret\":\"YMWln933uEHY295Omb0o8B9pkN8wedFM\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,49,NULL,'2026-02-12 20:30:33.031731'),(72,5,'admin','PUT','/api/apps/7','{}','{\"name\":\"777\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',500,0,'Property \"trial_enabled\" was not found in \"App\". Make sure your query is correct.','2026-02-12 20:30:39.275656'),(73,5,'admin','PUT','/api/apps/7','{}','{\"name\":\"777\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":false,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',500,0,'Property \"trial_enabled\" was not found in \"App\". Make sure your query is correct.','2026-02-12 20:30:42.857056'),(74,5,'admin','PUT','/api/apps/7','{}','{\"name\":\"777\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',500,2,'Property \"trial_enabled\" was not found in \"App\". Make sure your query is correct.','2026-02-12 20:31:22.093785'),(75,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','curl/8.7.1',200,0,NULL,'2026-02-12 20:32:32.244961'),(76,5,'admin','PUT','/api/apps/3','{}','{\"name\":\"TestApp_1770560064445\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,24,NULL,'2026-02-12 20:35:54.533770'),(77,5,'admin','PUT','/api/apps/3','{}','{\"name\":\"TestApp_1770560064445\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":true,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,9,NULL,'2026-02-12 20:36:05.248381'),(78,5,'admin','PUT','/api/apps/7','{}','{\"name\":\"777\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":true,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,14,NULL,'2026-02-12 20:36:52.180292'),(79,NULL,NULL,'PUT','/api/cloud/4','{}','{\"trigger_name\":\"ddddd\",\"code\":\"re\",\"app_id\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,16,NULL,'2026-02-12 20:37:10.559725'),(80,NULL,NULL,'PUT','/api/remote-variables/1','{}','{\"key\":\"notice\",\"value\":\"系统维护公告：2月10日凌晨2点-4点\",\"description\":\"公告信息 1\",\"app_id\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,25,NULL,'2026-02-12 20:37:16.585946'),(81,5,'admin','PUT','/api/users/11','{}','{\"username\":\"test_agent_01\",\"email\":\"\",\"password\":\"\",\"role\":\"agent\",\"balance\":0,\"is_active\":false,\"expire_at\":\"2026-02-11 08:00:07\",\"remark\":\"4\",\"level\":1,\"discount_rate\":100}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,47,NULL,'2026-02-12 20:37:27.444483'),(82,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,2,NULL,'2026-02-12 20:49:01.002255'),(83,5,'admin','PUT','/api/apps/7','{}','{\"name\":\"777\",\"version\":\"1.0.0\",\"download_url\":\"\",\"heart_interval\":60,\"force_update\":false,\"is_active\":true,\"trial_enabled\":false,\"trial_duration\":86400,\"trial_device_limit\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,9,NULL,'2026-02-12 20:50:49.865923'),(84,5,'admin','POST','/api/cards/generate','{}','{\"value\":24,\"app_id\":4,\"count\":1,\"remark\":\"\",\"card_type_id\":1}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,23,NULL,'2026-02-12 21:15:50.214277'),(85,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','python-requests/2.32.5',200,1,NULL,'2026-02-12 21:49:27.185298'),(86,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','python-requests/2.32.5',200,0,NULL,'2026-02-12 21:50:33.231020'),(87,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','python-requests/2.32.5',200,1,NULL,'2026-02-12 21:50:44.529172'),(88,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','python-requests/2.32.5',200,0,NULL,'2026-02-12 21:51:32.118895'),(89,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','python-requests/2.32.5',200,0,NULL,'2026-02-12 13:52:04.218552'),(90,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,4,NULL,'2026-02-12 13:54:56.326548'),(91,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',200,1,NULL,'2026-02-12 21:57:39.735248'),(92,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','python-requests/2.32.5',200,9,NULL,'2026-02-12 21:59:49.499631'),(93,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','python-requests/2.32.5',200,0,NULL,'2026-02-12 22:01:26.050018'),(94,NULL,NULL,'POST','/api/cards/trial','{}','{\"app_id\":7,\"hwid\":\"TEST-TRIAL-HWID-001\"}','::1','python-requests/2.32.5',500,2,'该应用未启用试用功能','2026-02-12 22:01:26.084765'),(95,6,'idouqq','POST','/api/auth/login','{}','{\"username\":\"idouqq\",\"password\":\"******\"}','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',200,0,NULL,'2026-02-12 22:04:52.952865'),(96,NULL,NULL,'POST','/api/cards/trial','{}','{\"app_id\":1,\"hwid\":\"765c037a130d5b146133a76d2277dc5e\"}','::1','python-requests/2.32.5',500,6,'该应用未启用试用功能','2026-02-12 22:05:11.812234'),(97,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','python-requests/2.32.5',200,1,NULL,'2026-02-12 22:05:11.903709'),(98,5,'admin','POST','/api/auth/login','{}','{\"username\":\"admin\",\"password\":\"******\"}','::1','python-requests/2.32.5',200,0,NULL,'2026-02-12 22:05:31.490535'),(99,NULL,NULL,'POST','/api/client/register','{}','{\"username\":\"test_user_001\",\"password\":\"******\",\"app_id\":1}','::1','python-requests/2.32.5',200,77,NULL,'2026-02-12 22:24:34.377886'),(100,NULL,NULL,'POST','/api/client/login','{}','{\"username\":\"test_user_001\",\"password\":\"******\",\"app_id\":1}','::1','python-requests/2.32.5',200,63,NULL,'2026-02-12 22:24:34.441892'),(101,5,'test_user_001','PUT','/api/client/heartbeat','{}','{}','::1','python-requests/2.32.5',200,2,NULL,'2026-02-12 14:24:34.449848');
/*!40000 ALTER TABLE `operation_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `remote_variable`
--

DROP TABLE IF EXISTS `remote_variable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `remote_variable` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `app_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `is_vip` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_249186d0fc9e12525f3a20befa7` (`app_id`),
  CONSTRAINT `FK_249186d0fc9e12525f3a20befa7` FOREIGN KEY (`app_id`) REFERENCES `app` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `remote_variable`
--

LOCK TABLES `remote_variable` WRITE;
/*!40000 ALTER TABLE `remote_variable` DISABLE KEYS */;
INSERT INTO `remote_variable` VALUES (1,'notice','系统维护公告：2月10日凌晨2点-4点','公告信息 1',1,'2026-02-08 01:10:48.218449','2026-02-12 20:37:16.000000',0);
/*!40000 ALTER TABLE `remote_variable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','agent','user') NOT NULL DEFAULT 'user',
  `agent_level` int NOT NULL DEFAULT '0',
  `parent_id` bigint DEFAULT NULL,
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `points` bigint NOT NULL DEFAULT '0',
  `hwid_lock` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'testuser','test123','user',0,NULL,0.00,0,NULL,'test@example.com',1,'2026-02-07 14:00:24.565342','2026-02-07 14:00:24.565342'),(3,'newtestuser','password123','user',0,NULL,0.00,0,NULL,NULL,1,'2026-02-07 15:52:13.042690','2026-02-07 15:52:13.042690'),(6,'admin','admin123','admin',0,NULL,0.00,0,'','',1,'2026-02-08 01:43:37.000000','2026-02-08 03:37:52.000000');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-13  7:56:26
