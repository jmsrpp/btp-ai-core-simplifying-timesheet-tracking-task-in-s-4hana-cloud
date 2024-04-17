namespace sap.timesheet;

entity Conversation {

    key cID : UUID not null;
    userID: String;
    creation_time: Timestamp;
    last_update_time: Timestamp;
    timerecordID: String;
    status:String;
    WBSElement:String;
    to_messages: Composition of many Message on to_messages.cID = $self;
}

entity Message {

    key cID: Association to Conversation;
    key mID: UUID not null;
    role: String;
    content: LargeString;
    creation_time: Timestamp;
}

