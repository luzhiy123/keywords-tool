/*
 Navicat PostgreSQL Data Transfer

 Source Server         : los
 Source Server Type    : PostgreSQL
 Source Server Version : 100005
 Source Host           : localhost:5432
 Source Catalog        : test
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 100005
 File Encoding         : 65001

 Date: 06/10/2018 22:59:16
*/


-- ----------------------------
-- Sequence structure for generator_id
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."generator_id";
CREATE SEQUENCE "public"."generator_id" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for plate_id
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."plate_id";
CREATE SEQUENCE "public"."plate_id" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for test_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."test_id_seq";
CREATE SEQUENCE "public"."test_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Table structure for generators
-- ----------------------------
DROP TABLE IF EXISTS "public"."generators";
CREATE TABLE "public"."generators" (
  "id" int8 NOT NULL DEFAULT nextval('generator_id'::regclass),
  "userid" int4 NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Table structure for plates
-- ----------------------------
DROP TABLE IF EXISTS "public"."plates";
CREATE TABLE "public"."plates" (
  "id" int8 NOT NULL DEFAULT nextval('plate_id'::regclass),
  "generatorid" int8 NOT NULL,
  "options" varchar(1000000) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "category" varchar(255) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
  "id" int8 NOT NULL DEFAULT nextval('test_id_seq'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(255) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."generator_id"', 60, true);
SELECT setval('"public"."plate_id"', 209, true);
SELECT setval('"public"."test_id_seq"', 107, true);

-- ----------------------------
-- Uniques structure for table generators
-- ----------------------------
ALTER TABLE "public"."generators" ADD CONSTRAINT "unique_name_userid" UNIQUE ("name", "userid");

-- ----------------------------
-- Uniques structure for table plates
-- ----------------------------
ALTER TABLE "public"."plates" ADD CONSTRAINT "unique_name_generatorid" UNIQUE ("options", "generatorid");

-- ----------------------------
-- Uniques structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "unique_goods_sid" UNIQUE ("name");

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");