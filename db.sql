IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'disaster_mis')
    CREATE DATABASE disaster_mis;
GO

USE disaster_mis;
GO