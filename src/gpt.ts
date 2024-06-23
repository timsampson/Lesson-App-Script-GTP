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

    for (let lessonPlan of unprocessedLessonPlans) {
        let isValidContent = await generateLessonContent(lessonPlan.summary);

        updateCompleted(lessonPlan.id, 'processed', SHEETSDB.lessonSequence, isValidContent);

        // Sleep for 1 second between requests to avoid overloading the API
        Utilities.sleep(1000);
    }
}


/**
 * Creates a lesson plan based on the provided summary.
 * 
 * @param {string} lessonPlanSummary - The summary of the lesson plan.
 */
async function generateLessonContent(lessonPlanSummary: string): Promise<boolean> {
    let promptObjDetails: PromptDetailsObj = getPromptObjDetails();
    let modelEndpoint = promptObjDetails.modelEndpoint;
    // Concatenate the system messages into one
    let systemMessageContent = `
        ${promptObjDetails.promptRole}
        ${promptObjDetails.promptStructure}
        ${promptObjDetails.promptDetails}
        ${promptObjDetails.promptFormat}
    `;

    let payload = {
        "model": "gpt-4o",
        "messages": [
            { "role": "system", "content": systemMessageContent },
            {
                "role": "user",
                "content": lessonPlanSummary
            },
        ],
        "temperature": 0.5,
        "max_tokens": 800,
        "frequency_penalty": 0,
        "presence_penalty": 0
    };
    let headers = {
        'Authorization': 'Bearer ' + apiKey,
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
        // Parse the cleaned JSON string
        let jsonContent = JSON.parse(cleanedContent);

        // Log the cleaned content for debugging
        Logger.log(jsonContent);

        // Write the data to the sheet
        writeDataToSheet(jsonContent);
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
    let writeLessonPlanResultsTab = SHEETSDB.activityContent;
    let lastRow = writeLessonPlanResultsTab.getLastRow();
    let lastId = writeLessonPlanResultsTab.getRange(lastRow, 1).getValue();
    Logger.log(lastId + 1);
    let nextId = lastId + 1;

    let row = [];

    row.push(nextId);
    row.push(data['Unit']);
    row.push(data['Title']);
    row.push(data['Period']);
    row.push(data['Main Topic']);
    row.push(data['Introduction']);
    row.push(data['Learning Objective 1']);
    row.push(data['Learning Objective 2']);
    row.push(data['Warm Up']);
    row.push(data['Key Terms and Definitions']);
    row.push(data['Essential Question']);
    row.push(data['True or False Question']);
    row.push(data['End of Lesson AP Classroom Big Idea Quiz']);
    row.push(data['Next Lesson Preview']);
    row.push(data['Answer Key for Essential Question']);
    row.push(data['Answer Key for True or False Question']);
    row.push(data['Completion Checklist']);

    writeLessonPlanResultsTab.appendRow(row);
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
        return obj.summary && obj.processed !== true;
    }).map(function (obj: any) {
        return obj;
    });

    return unprocessedSummaries as LessonSequence[];
}
