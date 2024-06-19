type PromptDetailsObj = {
    modelEndpoint: string,
    promptRole: string,
    promptDetails: string,
    promptFormat: string,
    promptStructure: string
}

function getPromptObjDetails(): PromptDetailsObj {
    let promptDetailsValues: Array<Array<string>> = SHEETSDB.promptDetails.getDataRange().getValues();
    // Remove the first row (header) from the data
    promptDetailsValues.shift();
    // Create the promptDetailsObj object
    let promptDetailsObj: Partial<PromptDetailsObj> = promptDetailsValues.reduce((obj, row) => {
        obj[row[0] as keyof PromptDetailsObj] = row[1];
        return obj;
    }, {} as Partial<PromptDetailsObj>);
    return promptDetailsObj as PromptDetailsObj;
}


async function processLessonPlans() {
    let lessonPlans = getLessonDetailsFromTab();

    for (let i = 0; i < lessonPlans.length; i++) {
        const lessonPlan = lessonPlans[i];
        Logger.log(lessonPlan.Summary);
        await createLessonPlan(lessonPlan.Summary);
        Logger.log(`Lesson Plan ${lessonPlan.id} rowID: 'Processed', lessonDetailsTab: cellValue: true  `);
        updateCompleted(lessonPlan.id, 'Processed', SHEETSDB.lessonSequence, true);

        if (i < lessonPlans.length - 1) {
            Utilities.sleep(1000);
        }
    }
}

async function createLessonPlan(lessonPlanSummary: string) {
    let promptObjDetails = getPromptObjDetails();
    let modelEndpoint = promptObjDetails.modelEndpoint;
    let promptRole = promptObjDetails.promptRole;
    let promptDetails = promptObjDetails.promptDetails;
    let promptFormat = promptObjDetails.promptFormat;
    let promptStructure = promptObjDetails.promptStructure;
    let payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "system", "content": promptRole
            },
            {
                "role": "system", "content": promptStructure
            },
            {
                "role": "system", "content": promptDetails
            },
            {
                "role": "system", "content": promptFormat
            },
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
    }

}
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

function getLessonDetailsFromTab() {
    let lessonPlanData = SHEETSDB.lessonSequence.getDataRange().getValues();
    let lessonPlanObjects = arrayOfObj(lessonPlanData);
    // Filter out rows where the "Summary" cell is not empty and the "Processed" cell is not true.
    let unprocessedSummaries = lessonPlanObjects.filter(function (obj: any) {
        return obj.Summary && obj.Processed !== true;
    }).map(function (obj: any) {
        return obj;
    });

    return unprocessedSummaries;
}

// lesson details google sheet column headers: Week	Order	Unit	Title	Period	Main Topic	Enduring Understanding	Suggested Skills	AP Classroom's Big Idea Quiz	Previous Lesson	Next Lesson	Summary	Processed
type lesson_details_tab = {
    id: number,
    Week: string,
    Order: string,
    Unit: string,
    Title: string,
    Period: string,
    Main_Topic: string,
    Enduring_Understanding: string,
    Suggested_Skills: string,
    AP_Classroom_s_Big_Idea_Quiz: string,
    Previous_Lesson: string,
    Next_Lesson: string,
    Summary: string,
    Processed: string
}