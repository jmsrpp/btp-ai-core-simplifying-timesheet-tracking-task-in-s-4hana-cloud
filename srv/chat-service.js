const cds = require('@sap/cds');
const { DELETE } = cds.ql;
const { handleMemoryBeforeRagCall, handleMemoryAfterRagCall } = require('./memory-helper');
const currentTimestampISO= new Date().toISOString().replace(/Z$/, '');

const { v4: uuidv4 } = require('uuid');


module.exports = function () {

    this.on('getChatResponse', async (req) => {
        const { conversationId, messageId, message_time, user_id, user_query,company_code, activity_type } = req.data;
        const { Conversation, Message } = this.entities;

        const systemPrompt = `You are an assistant that creates the body for OData V4 POST messages and parameters from plain English. 
                        If assistant have all information to answer, it is super important that assistant does not provide any explanation and the response should be an OData V4 raw body in JSON like example between {}. 
                        If assistant need more information to fill all mandatory fields, ask user to provide supplemental information.
                        Assitant needs to generate the payload based on instructions between<>.
                        {
                        "TimeSheetDataFields": {
                            "ActivityType": "",
                            "WBSElement": "",
                            "TimeSheetNote": "",
                            "RecordedHours": "",
                            "RecordedQuantity": "1",
                            "HoursUnitOfMeasure": "H"
                        },
                        "CompanyCode": "1710",
                        "PersonWorkAgreement": "50008075",
                        "TimeSheetDate": "",
                        "TimeSheetOperation": "C",
                        "TimeSheetIsReleasedOnSave": false
                        }

                        <
                        'ActivityType': Use '${activity_type}',
                        'WBSElement': Project name from user input, mandatory, cannot be empty.
                        'TimeSheetNote': Use default value 'API Posting',
                        'RecordedHours': This is mandatory field, cannot be empty. It is time duration from user input. Assistant need to convert it into hours. If assistant cannot figure out, ask user to provide,
                        'RecordedQuantity': Use default value '1',
                        'HoursUnitOfMeasure': Use default value 'H'
                        'CompanyCode': Use '${company_code}',
                        'PersonWorkAgreement': Use '${user_id}',
                        'TimeSheetDate': Use ${currentTimestampISO} if user doesn't provide time info,
                        'TimeSheetOperation': Use 'C' for user create intention, 'D' for delete intention,
                        'TimeSheetIsReleasedOnSave': Use default value 'false'
                        >
                        `;
        try {
            //console.log(req.data);
            //request input data
      

            //handle memory before the LLM call
            const memoryContext = await handleMemoryBeforeRagCall (conversationId , messageId, message_time, user_id , user_query, Conversation, Message );
            
            var currentContext = [...memoryContext];
            currentContext.unshift({
                "role":"system",
                "content":systemPrompt
            });
            currentContext.push({
                "role":"user",
                "content":user_query
            });

            const LLMPrompt ={
                "messages": currentContext
            }

            console.log("LLM Prompt: ",LLMPrompt);

            const vectorplugin = await cds.connect.to("cap-llm-plugin");
            let LLMResponse = await vectorplugin.getChatCompletion(LLMPrompt);
            console.log("LLMResponse: ",LLMResponse);

            
            //handle memory after the LLM call
            const responseMsgID = uuidv4();
            try {
                JSON.parse(LLMResponse.content);
            } catch (error) {
                await handleMemoryAfterRagCall (conversationId, responseMsgID , message_time, LLMResponse, Message, Conversation );
            }

            const response = {
                "cID_cID" : conversationId,
                "mID" : responseMsgID,
                "role" : LLMResponse.role,
                "content" : LLMResponse.content,
                "creation_time": message_time,
            };
            return response;
            
        }
        catch (error) {
            // Handle any errors that occur during the execution
            console.log('Error while generating response for user query:', error);
            throw error;
        }

    })


    this.on('deleteChatData', async () => {
        try {
            const { Conversation, Message } = this.entities;
            await DELETE.from(Conversation).where ({ userID: 'I849435' });
            await DELETE.from(Message);
            return "Success!"
        }
        catch (error) {
            // Handle any errors that occur during the execution
            console.log('Error while deleteing the chat content in db:', error);
            throw error;
        }
    })

}