/**
 * Retrieves the prompt object details from the Google Sheets database.
 * 
 * @returns {PromptDetailsObj} An object containing prompt details.
 */
function getPromptObjDetails(): PromptDetailsObj {
    let promptDetailsValues = SHEETSDB.promptDetails.getDataRange().getValues();

    // Convert the 2D array to an array of objects
    let promptDetailsArray = arrayOfObj(promptDetailsValues);

    // Extract the first object from the array
    let promptDetails = promptDetailsArray[0];

    return promptDetails as PromptDetailsObj;
}
/**
 * Processes records from the lesson sequence sheet.
 */
async function processLessonContent() {
    let unprocessedLessonPlans: LessonSequence[] = getLessonDetailsFromTab();

    for (let LessonDetailsRecords of unprocessedLessonPlans) {
        let isValidContent = await generateLessonContent(LessonDetailsRecords);

        updateCompleted(LessonDetailsRecords.id, 'processed', SHEETSDB.lessonSequence, isValidContent);

        // Sleep for 1 second between requests to avoid overloading the API
        Utilities.sleep(1000);
    }
}


/**
 * Creates a lesson plan based on the provided summary.
 * 
 * @param {string} lessonPlanSummary - The summary of the lesson plan.
 */
async function generateLessonContent(lessonPlanSummary): Promise<boolean> {

    let lessonPlanSummaryObject = {
        unit: lessonPlanSummary.unit,
        title: lessonPlanSummary.title,
        period: lessonPlanSummary.period,
        mainTopic: lessonPlanSummary.mainTopic,
        subTopics: lessonPlanSummary.subTopics,
        apObjectives: lessonPlanSummary.apObjectives,
        bigIdeaQuiz: lessonPlanSummary.bigIdeaQuiz,
        previousLessonTopic: lessonPlanSummary.previousLessonTopic,
        nextLessonTopic: lessonPlanSummary.nextLessonTopic,
        lectureVideoTitle: lessonPlanSummary.lectureVideoTitle,
        shortsVideoTitle: lessonPlanSummary.shortsVideoTitle,
    };
    let promptObjDetails: PromptDetailsObj = getPromptObjDetails();
    let modelEndpoint = promptObjDetails.modelEndpoint;
    let model = promptObjDetails.model;
    let payload = {
        "model": model,
        "response_format": { "type": "json_object" },
        "messages": [
            {
                "role": "system", "content": promptObjDetails.promptRole
            },
            {
                "role": "system", "content": promptObjDetails.promptDetails
            },
            {
                "role": "system", "content": promptObjDetails.promptFormat
            }, {
                "role": "user",
                "content": JSON.stringify(lessonPlanSummaryObject)
            },
        ],
        "temperature": 0.5,
        "max_tokens": 800,
        "frequency_penalty": 0,
        "presence_penalty": 0
    };
    let headers = {
        'Authorization': 'Bearer ' + promptObjDetails.apiKey,
        'Content-Type': 'application/json'
    };
    let options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
        method: 'post',
        headers: headers,
        payload: JSON.stringify(payload)
    };
    let response = UrlFetchApp.fetch(modelEndpoint, options);
    let data = JSON.parse(response.getContentText());

    let rawContent = data['choices'][0]['message']['content'];

    // Remove backticks and "json" keyword if present
    let cleanedContent = rawContent.replace(/```json|```/g, '').trim();
    try {
        let activityRecord = {
            ...JSON.parse(cleanedContent),
            unit: lessonPlanSummary.unit,
            title: lessonPlanSummary.title,
            period: lessonPlanSummary.period,
            mainTopic: lessonPlanSummary.mainTopic,
            subTopics: lessonPlanSummary.subTopics,
            apObjectives: lessonPlanSummary.apObjectives,
            previousLessonTopic: lessonPlanSummary.previousLessonTopic,
            nextLessonTopic: lessonPlanSummary.nextLessonTopic,
            bigIdeaQuiz: lessonPlanSummary.bigIdeaQuiz,
            model: promptObjDetails.model,
            lectureVideoTitle: lessonPlanSummary.lectureVideoTitle,
            videoLecture: lessonPlanSummary.videoLecture,
            shortsVideoTitle: lessonPlanSummary.shortsVideoTitle,
            videoTopic: lessonPlanSummary.videoTopic
        };

        // Write the data to the sheet
        writeDataToSheet(activityRecord);
    } catch (error) {
        Logger.log("Failed to parse JSON: " + error.message);
        Logger.log("Raw Content: " + rawContent);
        return false;
    }
    return true;
}

/**
 * Writes data to the Google Sheets.
 * 
 * @param {string} data - The data to be written to the sheet.
 */
function writeDataToSheet(data: string) {
    let lessonContentRecordTab = SHEETSDB.activityContent;
    let lastRow = lessonContentRecordTab.getLastRow();
    let lastId = lessonContentRecordTab.getRange(lastRow, 1).getValue();
    let nextId = lastId + 1;

    let row = [];
    // the naming convention uses two styles, one is the camel case, which is used in the Sheets headers and code,
    // The bracket notation is used for GPT reponses. 
    row.push(nextId);
    row.push(data['unit']);
    row.push(data['title']);
    row.push(data['period']);
    row.push(data['mainTopic']);
    row.push(data['subTopics']);
    row.push(data['apObjectives']);
    row.push(data['Introduction']);
    row.push(data['Learning Objective 1']);
    row.push(data['Learning Objective 2']);
    row.push(data['Warm Up']);
    row.push(data['Key Terms and Definitions']);
    row.push(data['Essential Question']);
    row.push(data['True or False Question']);
    row.push(data['bigIdeaQuiz']);
    row.push(data['previousLessonTopic']);
    row.push(data['nextLessonTopic']);
    row.push(data['Next Lesson Preview']);
    row.push(data['Answer Key for Essential Question']);
    row.push(data['Answer Key for True or False Question']);
    row.push(data['Completion Checklist']);
    row.push(data['lectureVideoTitle']);
    row.push(data['videoLecture']);
    row.push(data['shortsVideoTitle']);
    row.push(data['videoTopic']);
    row.push(data['model']);

    lessonContentRecordTab.appendRow(row);
}

/**
 * Retrieves lesson details from the Google Sheets tab.
 * 
 * @returns {Array<Object>} An array of unprocessed lesson plan objects.
 */
function getLessonDetailsFromTab(): LessonSequence[] {
    let lessonPlanData = SHEETSDB.lessonSequence.getDataRange().getValues();
    let lessonPlanObjects: LessonSequence[] = arrayOfObj(lessonPlanData);
    // Filter out rows where the "Summary" cell is not empty and the "Processed" cell is not true.
    let unprocessedSummaries = lessonPlanObjects.filter(function (obj: LessonSequence) {
        return obj.processed !== true;
    }).map(function (obj: any) {
        return obj;
    });

    return unprocessedSummaries as LessonSequence[];
}
