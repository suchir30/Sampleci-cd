DROP VIEW IF EXISTS ViewHubLoadFactor;

-- CREATE VIEW ViewHubLoadFactor AS
-- SELECT
--     HLFLineItem.id,
--     AirWayBill.AWBCode AS 'nscsAwb',
--     AirWayBill.numOfArticles AS 'numOfArticles',
--     AirWayBill.rollupWeight AS 'actualWeight',
--     AirWayBill.rollupVolume / 1000 AS 'CDM',
--     AirWayBill.AWBChargedWeight AS 'chargedWeight',
--     Branch.branchCode AS 'currentHub',
--     ToBranch.branchCode AS 'finalDestination',
--     HLFLineItem.HLFLineStatus AS 'status',
--     NULL AS inwardedDate,
--     AirWayBill.createdOn AS 'awbDate',
--     AirWayBill.rollupShortCount AS 'depsCount'  -- Now pulling rollupShortCount from AirWayBill
-- FROM Branch
-- INNER JOIN HLFLineItem ON Branch.id = HLFLineItem.branchId
-- INNER JOIN AirWayBill ON AirWayBill.id = HLFLineItemAWBId
-- LEFT OUTER JOIN AwbLineItem ON AwbLineItem.AWBId = AirWayBill.id
-- LEFT OUTER JOIN Branch AS ToBranch ON AirWayBill.toBranchId = ToBranch.id
-- WHERE HLFLineItem.HLFLineStatus IN ('Inwarded', 'ToBeInwarded');


-- view ViewHubLoadFactor {
--   id               Int       @id @unique
--   nscsAwb          String
--   numOfArticles    Int?
--   actualWeight     Float?
--   CDM              Float?
--   chargedWeight    Float?
--   currentHub       String?
--   finalDestination String?
--   status           String?
--   inwardedDate     DateTime?
--   awbDate          DateTime?
--   depsCount        Int?
-- }