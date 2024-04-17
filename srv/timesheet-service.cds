using {sap.timesheet as db} from '../db/schema';

service TimesheetService @(path: '/timesheet-processor', requires: 'any'){

    entity Conversation as projection on db.Conversation;
    entity Message as projection on db.Message;

    type TimesheetDataFieldItem {
            ControllingArea: String;
            SenderCostCenter: String;
            ReceiverCostCenter: String;
            InternalOrder: String;
            ActivityType: String;
            WBSElement: String;
            WorkItem: String;
            BillingControlCategory: String;
            PurchaseOrder: String;
            PurchaseOrderItem: String;
            TimeSheetTaskType: String;
            TimeSheetTaskLevel: String;
            TimeSheetTaskComponent: String;
            TimeSheetNote: String;
            RecordedHours: String;
            RecordedQuantity: String;
            HoursUnitOfMeasure: String;
            RejectionReason: String;
            TimeSheetWrkLocCode: String;
            TimeSheetOvertimeCategory: String;
            SenderPubSecFund: String;
            SendingPubSecFunctionalArea: String;
            SenderPubSecGrant: String;
            SenderPubSecBudgetPeriod: String;
            ReceiverPubSecFund: String;
            ReceiverPubSecFuncnlArea: String;
            ReceiverPubSecGrant: String;
            ReceiverPubSecBudgetPeriod: String;
    }

    type TimesheetCollection{
        TimeSheetDataFields: TimesheetDataFieldItem;
        PersonWorkAgreementExternalID: String;
        CompanyCode: String;
        TimeSheetRecord: String;
        PersonWorkAgreement: String;
        TimeSheetDate: String;
        TimeSheetIsReleasedOnSave: Boolean;
        TimeSheetPredecessorRecord: String;
        TimeSheetStatus: String;
        TimeSheetIsExecutedInTestRun: Boolean;
        TimeSheetOperation: String;
    }


    type ProjectDemandResourceAssignment{
        ProjDmndRsceAssgmtUUID: String;
        ProjectDemandWorkUUID: String;
        ProjectDemandUUID: String;
        ProjDmndRsceAssgmt: String;
        ProjDmndRsceAssgmtQuantity: String;
        ProjDmndRsceAssgmtQuantityUnit: String;
        ProjectDemandSupplyIdentifier: String;
        ProjectDemandSupplyDeliveryOrg: String;
        ProjectDemandSourceOfSupply: String;
        ProjAssgmtLastUpdateSource: String;
        ProjDmndRsceWorkAssgmtOID: String;
        ProjDmndRsceWrkfrcPersonOID: String;
        ProjDmndRsceAssgmtStartDate: String;
        ProjDmndRsceAssgmtEndDate: String;
        CreatedByUser: String;
        CreationDateTime: String;
        LastChangedByUser: String;
        LastChangeDateTime: String;
        to_Root:ProjectDemandResourceAssignment_toRoot;
        to_Work:ProjectDemandResourceAssignment_toWork;
    }
    type ProjectDemandResourceAssignment_toRoot{
        ProjectDemandUUID: String;
        ProjectDemand: String;
        ProjectDemandName: String;
        ProjectDemandDescription: String;
        ProjectDemandCategory: String;
        ProjectDemandType: String;
        ReferencedObjectUUID: String;
        ProjectDemandStatus: String;
        ProjectDemandDateMaintenance: String;
        ProjectDemandStartDate: String;
        ProjectDemandEndDate: String;
        ProjectDemandReleasedDateTime: String;
        ProjDmndActualSupplyDate: String;
        ProjectDemandPerUnitAmount: String;
        ProjectDemandRequestCurrency: String;
        ProjDmndRequestedQuantityUnit: String;
        PriceUnitQty: String;
        ProjectDemandRequestNetAmount: String;
        ProjDmndReqNetAmountCurrency: String;
        ProjectDemandOverallAmount: String;
        ProjectDemandExpectedAmount: String;
        ProjDmndRequestedQuantity: String;
        Plant: String;
        PurchasingGroup: String;
        PurchasingOrganization: String;
        CreatedByUser: String;
        CreationDateTime: String;
        LastChangedByUser: String;
        LastChangeDateTime: String;
        ProjectDemandLastChangedByUser: String;
        ProjDemandLastChangeDateTime: String;
        ProjDmndExternalReferenceUUID: String;
    }
    type ProjectDemandResourceAssignment_toWork{
        ProjectDemandWorkUUID: String;
        ProjectDemandUUID: String;
        CostCenter: String;
        ActivityType: String;
        ProjDmndAssgmtStatus: String;
        ProjectElementWorkItem: String;
        ProjDmndBillingControlCategory: String;
        ProjDmndRequestedDeliveryOrg: String;
    }

    type ProjectElement{
        ActivityType:String;
        ChangeEntProjElmntPosition_ac: Boolean;
        ChangeEntProjElmntProcgStatus_ac: Boolean;
        ActualEndDate_fc: Integer;
        ActualStartDate_fc: Integer;
        ControllingArea_fc: Integer;
        CostingSheet_fc: Integer;
        FactoryCalendar_fc: Integer;
        FunctionalArea_fc: Integer;
        FunctionalLocation_fc: Integer;
        Location_fc: Integer;
        PlannedEndDate_fc: Integer;
        PlannedStartDate_fc: Integer;
        Plant_fc: Integer;
        ProfitCenter_fc: Integer;
        ProjectElement_fc: Integer;
        ProjectElementDescription_fc: Integer;
        ResponsibleCostCenter_fc: Integer;
        ResultAnalysisInternalID_fc: Integer;
        TaxJurisdiction_fc: Integer;
        WBSElementIsBillingElement_fc: Integer;
        Delete_mc: Boolean;
        Update_mc: Boolean;
        to_EntProjElmntBlkFunc_oc: Boolean;
        to_EntProjElmntDlvbrl_oc: Boolean;
        to_EntProjElmntWorkItem_oc: Boolean;
        to_SubProjElement_oc: Boolean;
        ProjectElementUUID: String;
        ProjectElement: String;
        WBSElementInternalID: String;
        ProjectUUID: String;
        ProjectElementDescription: String;
        ParentObjectUUID: String;
        ProjectElementOrdinalNumber: String;
        ProcessingStatus: String;
        EntProjectElementType: String;
        PlannedStartDate: String;
        PlannedEndDate: String;
        ActualStartDate: String;
        ActualEndDate: String;
        ResponsibleCostCenter: String;
        CompanyCode: String;
        ProfitCenter: String;
        FunctionalArea: String;
        ControllingArea: String;
        Plant: String;
        Location: String;
        TaxJurisdiction: String;
        FunctionalLocation: String;
        FactoryCalendar: String;
        CostingSheet: String;
        InvestmentProfile: String;
        WBSIsStatisticalWBSElement: String;
        CostCenter: String;
        WBSElementIsBillingElement: String;
        ResultAnalysisInternalID: String;
        IsProjectMilestone: String;
        CreatedByUser: String;
        CreationDateTime: String;
        LastChangeDateTime: String;
        LastChangedByUser: String;
    }
    type User{
        PersonWorkAgreement:String;
        PersonFullName:String;
        Person:String;
        PersonExternalID:String;
        BusinessPartner:String;
        IndependentAddressID:String;
        BusinessPartnerName:String;
        DefaultEmailAddress:String;
    }
    //action createTimesheetCollection(ProjectName:String, ActivityType:String, CompanyCode:String,EmployeeID:String, RecordedHours:String,TimeSheetDate:String) returns TimesheetCollection;
    action createTimeRecord(Payload:String,conversationId: String) returns TimesheetCollection;
    action getProjectElement(EmployeeID:String) returns many ProjectElement;
    action getTimeRecord(EmployeeID:String, StartDate:String, EndDate:String) returns many TimesheetCollection;
    action getUser(EmployeeEmail:String) returns many User;


}