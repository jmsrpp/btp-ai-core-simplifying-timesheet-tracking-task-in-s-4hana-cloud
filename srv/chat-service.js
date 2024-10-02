const cds = require("@sap/cds");
const { DELETE } = cds.ql;
const {
  handleMemoryBeforeRagCall,
  handleMemoryAfterRagCall,
} = require("./memory-helper");
//const currentTimestampISO= new Date().toISOString().replace(/Z$/, '');

const { v4: uuidv4 } = require("uuid");

function initDateTrainingData() {
  const currentDate = new Date();
  const lastMonthDate = new Date(currentDate);
  const lastYearDate = new Date(currentDate);
  const nextMonthDate = new Date(currentDate);
  const nextYearDate = new Date(currentDate);

  lastMonthDate.setMonth(currentDate.getMonth() - 1);
  lastYearDate.setFullYear(currentDate.getFullYear() - 1);
  nextMonthDate.setMonth(currentDate.getMonth() + 1);
  nextYearDate.setFullYear(currentDate.getFullYear() + 1);

  const roundToNearestHour = (date) => {
    const roundedDate = new Date(date);
    roundedDate.setMinutes(0, 0, 0);
    if (date.getMinutes() >= 30) {
      roundedDate.setHours(roundedDate.getHours() + 1);
    }
    return roundedDate;
  };

  const formatDateToEpochUTC = (date) =>
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours()
    );

  const formatToISOStringLocal = (date) => {
    const localISOTime = date.toISOString();
    return localISOTime;
  };

  const formatDate = (date) => {
    const roundedDate = roundToNearestHour(date);
    const localDate = new Date(roundedDate.getTime() - roundedDate.getTimezoneOffset() * 60000);
    return {
      dateStringUTC: roundedDate.toISOString(),
      dateStringLocal: localDate.toISOString(),
      epochUTC: formatDateToEpochUTC(roundedDate),
      epochLocal: localDate.getTime(),
    };
  };

  return [
    {
      label: "Current Date",
      CurrentDateStringUTC: formatDate(currentDate).dateStringUTC,
      CurrentDateStringLocal: formatDate(currentDate).dateStringLocal,
      CurrentDateEpochUTC: formatDate(currentDate).epochUTC,
      CurrentDateEpochLocal: formatDate(currentDate).epochLocal,
    },
    {
      label: "Last Month Date",
      LastMonthDateStringUTC: formatDate(lastMonthDate).dateStringUTC,
      LastMonthDateStringLocal: formatDate(lastMonthDate).dateStringLocal,
      LastMonthDateEpochUTC: formatDate(lastMonthDate).epochUTC,
      LastMonthDateEpochLocal: formatDate(lastMonthDate).epochLocal,
    },
    {
      label: "Last Year Date",
      LastYearDateStringUTC: formatDate(lastYearDate).dateStringUTC,
      LastYearDateStringLocal: formatDate(lastYearDate).dateStringLocal,
      LastYearDateEpochUTC: formatDate(lastYearDate).epochUTC,
      LastYearDateEpochLocal: formatDate(lastYearDate).epochLocal,
    },
    {
      label: "Next Month Date",
      NextMonthDateStringUTC: formatDate(nextMonthDate).dateStringUTC,
      NextMonthDateStringLocal: formatDate(nextMonthDate).dateStringLocal,
      NextMonthDateEpochUTC: formatDate(nextMonthDate).epochUTC,
      NextMonthDateEpochLocal: formatDate(nextMonthDate).epochLocal,
    },
    {
      label: "Next Year Date",
      NextYearDateStringUTC: formatDate(nextYearDate).dateStringUTC,
      NextYearDateStringLocal: formatDate(nextYearDate).dateStringLocal,
      NextYearDateEpochUTC: formatDate(nextYearDate).epochUTC,
      NextYearDateEpochLocal: formatDate(nextYearDate).epochLocal,
    },
  ];
}

module.exports = function () {
  this.on("getChatResponse", async (req) => {
    const dateTrainingData = initDateTrainingData();
    console.log("Date Training Data: ", dateTrainingData);
    const {
      conversationId,
      messageId,
      message_time,
      user_id,
      user_query,
      company_code,
      activity_type,
    } = req.data;
    const { Conversation, Message } = this.entities;

    const systemPrompt = `You are an assistant that creates the JSON body for OData V2 POST messages from plain English. 
                        If assistant has all information needed to answer, assistant must not provide any explanation,comments, or markdown. Response must raw JSON like the example between {}.
                        If user requests entries for multiple days, JSON should be an array of objects, with the array having a key of "d". Single dates should not have the "d" key and just be an object. 
                        If assistant needs more information to fill all mandatory fields, ask user to provide supplemental information.
                        Assistant needs to generate the payload based on instructions between<>.
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
                        'TimeSheetDate': Date or DateTime from user input. Format your response as '/Date(x)/' where x = number of milliseconds between user input and the epoch. You can find training data in the following array, with each object holding datetime string in UTC, datetime string in locale where Assistant is running, and corresponding epoch integer values. All objects are labeled to provide context on the relationship between dates and epoch representation: ${JSON.stringify(
                          dateTrainingData
                        )}. If user doesn't provide year, Assistant must use ${dateTrainingData[0].CurrentDateStringLocal.slice(0,4)}. Value is localized so keep that in mind when converting. If user does not provide time zone, use Pacific Time (UTC-7). If Assistant doesn't understand the date range, assistant must ask for clarification.,
                        'TimeSheetOperation': Use 'C' for user create intention, 'D' for delete intention,
                        'TimeSheetIsReleasedOnSave': Use default value 'false'
                        >
                        `;
    try {
      //console.log(req.data);
      //request input data

      //handle memory before the LLM call
      const memoryContext = await handleMemoryBeforeRagCall(
        conversationId,
        messageId,
        message_time,
        user_id,
        user_query,
        Conversation,
        Message
      );

      var currentContext = [...memoryContext];
      currentContext.unshift({
        role: "system",
        content: systemPrompt,
      });
      currentContext.push({
        role: "user",
        content: user_query,
      });

      const LLMPrompt = {
        messages: currentContext,
      };

      console.log("LLM Prompt: ", LLMPrompt);

      const vectorplugin = await cds.connect.to("cap-llm-plugin");
      const completionModelConfig = cds.env.requires["gen-ai-hub"]["gpt-4o"];
      let LLMResponse = await vectorplugin.getChatCompletionWithConfig(completionModelConfig, LLMPrompt);
      const LLMResponseContent = LLMResponse.choices[0].message.content;
      const LLMResponseRole = LLMResponse.choices[0].message.role;
      console.log("LLMResponse: ", LLMResponseContent);

      //handle memory after the LLM call
      const responseMsgID = uuidv4();
      try {
        JSON.parse(LLMResponseContent);
      } catch (error) {
        await handleMemoryAfterRagCall(
          conversationId,
          responseMsgID,
          message_time,
          LLMResponse,
          Message,
          Conversation
        );
      }

      const response = {
        cID_cID: conversationId,
        mID: responseMsgID,
        role: LLMResponseRole,
        content: LLMResponseContent,
        creation_time: message_time,
      };
      return response;
    } catch (error) {
      // Handle any errors that occur during the execution
      console.log("Error while generating response for user query:", error);
      throw error;
    }
  });

  this.on("deleteChatData", async () => {
    try {
      const { Conversation, Message } = this.entities;
      await DELETE.from(Conversation).where({ userID: "I849435" });
      await DELETE.from(Message);
      return "Success!";
    } catch (error) {
      // Handle any errors that occur during the execution
      console.log("Error while deleting the chat content in db:", error);
      throw error;
    }
  });
};
