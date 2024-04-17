using {sap.timesheet as db} from '../db/schema';


service ChatService @(path: '/chat-processor', requires: 'any'){

    entity Conversation as projection on db.Conversation;
    entity Message as projection on db.Message;


    action getChatResponse(conversationId: String, messageId: String, message_time: Timestamp, user_id: String, user_query: String, company_code:String, activity_type:String) returns Message;
    function deleteChatData() returns String;

}