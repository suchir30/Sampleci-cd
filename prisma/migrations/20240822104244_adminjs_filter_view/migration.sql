Create ViEW ViewHubLoadFactor As
SELECT
	HLFLineItem.id,
	AirWayBill.AWBCode as 'nscsAwb',
	AirWayBill.numOfArticles as 'numOfArticles',
    AirWayBill.rollupWeight as 'actualWeight',
    AirWayBill.rollupVolume / 1000 as 'CDM',
    AirWayBill.rollupChargedWtInKgs as 'chargedWeight',
    Branch.branchCode as 'currentHub',
    ToBranch.branchCode as 'finalDestination',
    HLFLineItem.HLFLineStatus as 'status',
    NULL as inwardedDate,
    AirWayBill.createdOn as 'awbDate',
    DEPS.numberOfDepsArticles as 'depsCount'
	FROM Branch
	INNER JOIN HLFLineItem on Branch.id = HLFLineItem.branchId
    INNER JOIN AirWayBill on AirWayBill.id = HLFLineItemAWBId
    LEFT OUTER JOIN AwbLineItem on AwbLineItem.AWBId =  AirWayBill.id
    LEFT OUTER JOIN DEPS on DEPS.AWBId = AirWayBill.id
    LEFT OUTER JOIN Branch AS ToBranch ON AirWayBill.toBranchId = ToBranch.id
    AND (HLFLineItem.HLFLineStatus = 'Inwarded'
    OR HLFLineItem.HLFLineStatus = 'ToBeInwarded');
