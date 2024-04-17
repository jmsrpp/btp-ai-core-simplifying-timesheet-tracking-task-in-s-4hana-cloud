const cds = require('@sap/cds');
const { INSERT, SELECT, UPDATE } = cds.ql;
const { v4: uuidv4 } = require('uuid');

//helper method to get the current timestamp
function getCurrentTimestamp() {
    return new Date().toISOString();
}

//helper method to insert the messages and update the latest conversation timestamp in db
async function insertMessage(messageEntity, messageRecord, conversationId, conversationEntity, messageTime) {

    console.log(`Inserting new message for conversation id: ${conversationId}`);
    const messageInsertionStatus = await INSERT.into(messageEntity).entries([messageRecord]);
    if (!messageInsertionStatus) { throw new Error("Insertion of message into db failed!"); };

    console.log(`Updating the time for conversation id: ${conversationId}`);
    const updateConversationStatus = await UPDATE(conversationEntity).set`last_update_time = ${messageTime}`.where`cID = ${conversationId}`;
    if (updateConversationStatus !== 1) { throw new Error("Updating the conversation time failed!"); }
}

//helper method to handle conversation memory in HANA CLoud before RAG LLM call.
async function handleMemoryBeforeRagCall(conversationId, messageId, message_time, user_id, user_query, Conversation, Message) {
    try {

        const memoryContext = [];

        //check if conversation exists in the db
        const isConversationPresent = await SELECT.from(Conversation).where({ "cID": conversationId });

        //if conversation is present, select messages from db and store it in memory context obj
        if (isConversationPresent.length > 0) {
            console.log(`Retrieving messages for conversation id: ${conversationId}`);

            const messageSelectStmt = await SELECT.from(Message).where({ "cID_cID": conversationId }).orderBy('creation_time');
            if (messageSelectStmt.length > 0) {
                messageSelectStmt.forEach(message => {
                    memoryContext.push({
                        "role": message.role,
                        "content": message.content
                    });
                });
            }
            else { console.log(`Messages corresponding to conversation id: ${conversationId} not present!`) }
        }

        //if conversation isnot present, insert the conversation into db
        else {

            console.log(`Inserting new conversation for conversation id: ${conversationId}`);
            const currentTimestamp = getCurrentTimestamp()
            const conversationEntry = {
                "cID": conversationId,
                "userID": user_id,
                "creation_time": currentTimestamp,
                "last_update_time": currentTimestamp
            }
            const conversationInsertStatus = await INSERT.into(Conversation).entries([conversationEntry])
            if (!conversationInsertStatus) { throw new Error("Insertion of conversation into db failed!"); }
        }

        //in both cases, insert the message into db
        const messageRecord = {
            "cID_cID": conversationId,
            "mID": messageId,
            "role": "user",
            "content": user_query,
            "creation_time": message_time
        };

        await insertMessage(Message, messageRecord, conversationId, Conversation, message_time);
        return memoryContext;
    }

    catch (error) {
        // Handle any errors that occur during the execution
        console.log('Error handling memory prior to RAG response:', error);
        throw error;
    }
}

//helper method to handle conversation memory in HANA CLoud after RAG LLM call.
async function handleMemoryAfterRagCall(conversationId,messageID, message_time, chatRagResponse, Message, Conversation) {
    try {
        const aiMessageRecord = {
            "cID_cID": conversationId,
            "mID": messageID,
            "role": chatRagResponse.role,
            "content": chatRagResponse.content,
            "creation_time": message_time
        };

        //insert the assistant message to db
        await insertMessage(Message, aiMessageRecord, conversationId, Conversation, getCurrentTimestamp());
    }
    catch (error) {
        // Handle any errors that occur during the execution
        console.log('Error handling memory post RAG response:', error);
        throw error;
    }

}

module.exports = {
    handleMemoryBeforeRagCall,
    handleMemoryAfterRagCall,
    insertMessage
};