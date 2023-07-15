async function processLessonPlans() {
    let lessonPlans = getLessonDetailsFromTab();

    for (let i = 0; i < lessonPlans.length; i++) {
        const lessonPlan = lessonPlans[i];
        Logger.log(lessonPlan.Summary);
        createLessonPlan(lessonPlan.Summary);
        Logger.log(`Lesson Plan ${lessonPlan.id} rowID: 'Processed', lessonDetailsTab: cellValue: true  `);
        updateCompleted(lessonPlan.id, 'Processed', lessonDetailsTab, true);

        if (i < lessonPlans.length - 1) {
            Utilities.sleep(1000);
        }
    }
}

function createLessonPlan(lessonPlanSummary: string) {
    let modelEndpoint = 'https://api.openai.com/v1/chat/completions';
    let promptRole = `
    You are an experienced AP Computer Science A Java Teacher.
    You have expert knowledge regarding Bloom’s taxonomy and the Danielson framework.
    You create engaging lessons based primarily on content from the following curricular resources: CSAwesome, and the College Boards Computer Science A COURSE AND EXAM DESCRIPTION.
    You write AP style questions and assessments in the T.E.E.L writing format`;
    let promptDetails = `
    The 45 minute Lesson Activity Plan Structure is as follows and is in the format - title: description
    Main Topic: The main topic of the lesson. Include unit and sub-unit numbers if provided.
    Introduction: Briefly Introduce the main topic from the CSA Lesson as well as the other activities for the day, CSAwesome Readings and Practice as well as the AP Classroom's Big Idea Quiz if any. Be clear and concise.
    Learning Objectives:  Two learning objectives aligned to the Lesson with the following characteristics,  must use higher order thinking skills from Bloom’s Taxonomy, and match one or more of the following options, apply, analyze, evaluate, or create.
    Warm Up: An interesting warm up about the topic of the day and any relevance to the previous topic. Additionally give some learning strategy advice that is relevant to the lesson.
    Key Terms and Definitions: Three or more Key Term and definition pairs from the Lesson's main topic delimited by the character ' | '. in the Format of Term : Definition.
    Essential Question: Must be one or two of the following options, open-ended, challenging, relevant to the students' lives, broad enough to generate discussion.
    True or False Question: Must assess the major topic and objective of the lesson.
    End of Lesson AP Classroom Big Idea Quiz : Quiz Title and also a summary  of the topic based on details from the APCSA Course and Exam Description.
    Next Lesson Preview: A next lesson preview based on the next lesson topic.
    Answer Key for Essential Question: Must be written in T.E.E.L writing format.   
    Answer Key for True / False Question: Must be written step by step in T.E.E.L writing format. 
    Completion Checklist:  A comprehensive list of required activities, assignments and questions delimited by the character ' | '  .`;
    let promptFormat = `
    Response Format: JSON,
    JSON Keys: Unit, Title, Period, Main Topic, Introduction, Learning Objective 1, Learning Objective 2, Warm Up, Key Terms and Definitions, Essential Question, True or False Question, End of Lesson AP Classroom Big Idea Quiz, Next Lesson Preview, Answer Key for Essential Question, Answer Key for True or False Question, Completion Checklist. 
    `;
    let promptStructure = `
    Must always use ' | ' as the separators.`;
    let payload = {
        "model": "gpt-3.5-turbo-16k",
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
    let options = {
        method: 'post',
        headers: headers,
        payload: JSON.stringify(payload)
    };
    let response = UrlFetchApp.fetch(modelEndpoint, options);
    let data = JSON.parse(response.getContentText());
    Logger.log(data['choices'][0]['message']['content']);
    writeJSONToSheet(data['choices'][0]['message']['content']);
}
function writeJSONToSheet(data) {

    let tabName = 'scripting_docs';

    let writeLessonPlanResultsTab = courseSpreadsheet.getSheetByName(tabName);
    // convert json to array
    let lastRow = writeLessonPlanResultsTab.getLastRow();
    let lastId = writeLessonPlanResultsTab.getRange(lastRow, 1).getValue();
    Logger.log(lastId + 1);
    let nextId = lastId + 1;

    let row = [];
    let json = JSON.parse(data);
    row.push(nextId);
    row.push(json['Unit']);
    row.push(json['Title']);
    row.push(json['Period']);
    row.push(json['Main Topic']);
    row.push(json['Introduction']);
    row.push(json['Learning Objective 1']);
    row.push(json['Learning Objective 2']);
    row.push(json['Warm Up']);
    row.push(json['Key Terms and Definitions']);
    row.push(json['Essential Question']);
    row.push(json['True or False Question']);
    row.push(json['End of Lesson AP Classroom Big Idea Quiz']);
    row.push(json['Next Lesson Preview']);
    row.push(json['Answer Key for Essential Question']);
    row.push(json['Answer Key for True / False Question']);
    row.push(json['Completion Checklist']);

    writeLessonPlanResultsTab.appendRow(row);
}

function getLessonDetailsFromTab() {
    let lessonPlanData = lessonDetailsTab.getDataRange().getValues();
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

