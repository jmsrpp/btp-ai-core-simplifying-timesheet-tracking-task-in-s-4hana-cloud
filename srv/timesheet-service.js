const cds = require('@sap/cds');
const { INSERT, SELECT, UPDATE } = cds.ql;
const { v4: uuidv4 } = require('uuid');
const { insertMessage } = require('./memory-helper');
//var WBSmapping = {};


module.exports = async function (){
    this.on('getTimeRecord',async(req)=>{
  

        try {
            const { EmployeeID, StartDate, EndDate } = req.data;
            const TimesheetApi = await cds.connect.to("S4Timesheet_Destination");
            const getTimeRecordResponse = await TimesheetApi.tx(req).get(`/TimeSheetEntryCollection?$filter=TimeSheetDate ge datetime'${StartDate}' and TimeSheetDate le datetime'${EndDate}' and PersonWorkAgreement eq '${EmployeeID}'`)
            .then(response => {
                //console.log(response)

                return response
            })
            .catch(error => {
                console.error(error);
            });
            return getTimeRecordResponse;
        } catch (error) {
            console.log('Error while fetching time record: ', error);
            throw error;
        }
    
    
    });
    this.on('createTimeRecord', async (req, next) => {
        try {
            const TimesheetApi = await cds.connect.to("S4Timesheet_Destination");
            const { Payload, conversationId } = req.data;
            const { Conversation, Message } = this.entities;
            const currentTime = new Date().toISOString();

            const createTimesheetResponse = await TimesheetApi.send({
                method: 'post',
                path: '/TimeSheetEntryCollection',
                data: JSON.parse(JSON.parse(Payload))
            }).then(async response => {
                // console.log(response);
                const timerecordID = response.TimeSheetRecord;
                const WBSElement = response.TimeSheetDataFields.WBSElement;
                const successMessagegRecord = {
                    "cID_cID": conversationId,
                    "mID": uuidv4(),
                    "role": "assistant",
                    "content": "Time Record Created Successfully!",
                    "creation_time": currentTime
                };
                await insertMessage(Message,successMessagegRecord,conversationId, Conversation, currentTime);

                const updateWBSElement = await UPDATE(Conversation).set`WBSElement = ${WBSElement}`.where`cID = ${conversationId}`;
                if (updateWBSElement !== 1) { throw new Error("Updating the conversation WBSElement failed!"); }

                const successString = "Draft Saved";
                const updateTimeRecordID = await UPDATE(Conversation).set`timerecordID = ${timerecordID}`.where`cID = ${conversationId}`;
                if (updateTimeRecordID !== 1) { throw new Error("Updating the conversation timerecordID failed!"); }

                const updateStatus = await UPDATE(Conversation).set`status = ${successString}`.where`cID = ${conversationId}`;
                if (updateStatus !== 1) { throw new Error("Updating the conversation status failed!"); }

                return response;
            })
            .catch(async error => {
                const failMessagegRecord = {
                    "cID_cID": conversationId,
                    "mID": uuidv4(),
                    "role": "assistant",
                    "content": "Time Record Creation Failed!",
                    "creation_time": currentTime
                };
                const failString = "Failed";
                await insertMessage(Message,failMessagegRecord,conversationId, Conversation, currentTime);
                await UPDATE(Conversation).set`status = ${failString}`.where`cID = ${conversationId}`;

            });

            // const messageRecord = {
            //     "cID_cID": conversationId,
            //     "mID": messageId,
            //     "role": "user",
            //     "content": user_query,
            //     "creation_time": message_time
            // };
            //console.log(createTimesheetResponse);
            return createTimesheetResponse;
        }
        catch (error) {
            // Handle any errors that occur during the execution
            console.log('Error while creating time record: ', error);
            throw error;
        }
        
    });

    this.on("getProjectElement",async(req) => {
        try {
            //console.log(req.data);
            const { EmployeeID } = req.data;

            const currentDateString = new Date().toISOString().replace(/Z$/, '');
            const ProjectAssignmentApi = await cds.connect.to("S4Timesheet_ProjectAssignment_Destination");
            var referencedObjectUUIDArray = [];
            var activityTypeArray = [];
            const ProjectAssignmentResponse = await ProjectAssignmentApi.tx(req).get(`/A_ProjDmndResourceAssignment?$filter=ProjDmndRsceAssgmt eq '${EmployeeID}' and ProjDmndRsceAssgmtEndDate gt datetime'${currentDateString}' &$expand=to_Root,to_Work`)
            .then(response => {
                response.forEach(element => {

                    referencedObjectUUIDArray.push(element.to_Root.ReferencedObjectUUID);
                    activityTypeArray.push(element.to_Work.ActivityType);
                });
            })
            .catch(error => {
                console.error(error);
            });
            const ProjectElementApi = await cds.connect.to("S4Timesheet-ProjectElement-Destination");
            var ProjectElementResponse = [];

            for await (const referencedObjectUUID of referencedObjectUUIDArray) {
                var projectElement = await ProjectElementApi.tx(req).get(`/A_EnterpriseProjectElement(guid'${referencedObjectUUID}')`)
                .then(response => {
                    //WBSmapping[response.ProjectElement] = response.ProjectElementDescription;

                    return response;
                })
                .catch(error => {
                    console.error(error);
                });
                ProjectElementResponse.push(projectElement);
            };
            // console.log("MAPP",WBSmapping);

            ProjectElementResponse.forEach((element,index) => {
                element.ActivityType = activityTypeArray[index];
            });
            return ProjectElementResponse;

        }
        catch (error) {
            // Handle any errors that occur during the execution
            console.log('Error while getting ProjectResourceAssignment: ', error);
            throw error;
        }

    });

    this.on('getUser',async(req)=>{
  

        try {
            const { EmployeeEmail } = req.data;
            const UserApi = await cds.connect.to("S4Timesheet-User-Destination");
            const getUserResponse = await UserApi.tx(req).get(`/YY1_I_PersonWorkAgreement?$filter=DefaultEmailAddress eq '${EmployeeEmail}'`)
            .then(response => {
                //console.log(response)

                return response
            })
            .catch(error => {
                console.error(error);
            });
            return getUserResponse;
        } catch (error) {
            console.log('Error while fetching user detail: ', error);
            throw error;
        }
    
    
    });
}
