
/* 
** Wildlife Tracking Database Scrpt
** Updated on 03 May 2016 By:
**
** Jack Ngare
** 
** This Is The script required for Wildlife Tracking to work
** It contains The Schemas for the Tables required for the Wildlife Tracking solution to function
**
** ===== TABLES =======
** 01. Species
** 02. Users
** 03. WildlifeSightings

--=============================================================================================
									-- TABLES --
--=============================================================================================

*/


--- Drop the tables if they exist in the database
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'dbo.WildlifeSightings') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE dbo.WildlifeSightings
GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'dbo.Species') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE dbo.Species
GO

IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'dbo.Users') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE dbo.Users
GO


CREATE TABLE dbo.Species(
	SpeciesID int NOT NULL IDENTITY(1,1) PRIMARY KEY CLUSTERED,
	SpeciesName varchar(20)  NULL,
	SpeciesDescription varchar(500) NULL
	)
GO


CREATE TABLE dbo.Users(
	UserID int NOT NULL IDENTITY(1,1) PRIMARY KEY CLUSTERED,
	UserFullNames varchar(100) NOT NULL,
	UserName varchar(50) NOT NULL,
	UserPassword varchar(100) NULL,
	UserEmailAddress varchar(100) NOT NULL
	)
GO


CREATE TABLE dbo.WildlifeSightings(
	WildlifeSightingID int NOT NULL IDENTITY(1,1) PRIMARY KEY CLUSTERED,
	UserID int NOT NULL,--FK
	SpeciesID int NOT NULL,--FK
	Location varchar(100) NOT NULL,
	SightingDate datetime NULL,

	CONSTRAINT fkSightingsToSpecies FOREIGN KEY
	(SpeciesID) REFERENCES Species(SpeciesID),

	CONSTRAINT fkSightingsToUsers FOREIGN KEY
	(UserID) REFERENCES Users(UserID)
	)
GO


