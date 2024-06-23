/**
 * Creates a lesson plan document based on a template and the provided lesson content.
 * 
 * @param {LessonContent} lessonContent - The content for the lesson plan, including placeholders to be replaced.
 */
function createLessonPlan(lessonContent: LessonContent) {
    const LessonPlanTemplateID = "1OU-njdY2tVkeBBXyHnduv18JAvFg4CidwpWlUGn9kkA";
    const lessonPlanTemplate = DriveApp.getFileById(LessonPlanTemplateID);

    let activityFilename = (`U${lessonContent.unit}P${lessonContent.period} Activity Document ${lessonContent.title} ~ ${lessonContent.mainTopic}`);
    let parentFolder = lessonPlanTemplate.getParents().next();
    let copy = lessonPlanTemplate.makeCopy(activityFilename, parentFolder);
    // Get the document by ID
    let document = DocumentApp.openById(copy.getId());
    // Get the body of the document
    let body = document.getBody();
    let footer = document.getFooter();
    let header = document.getHeader();
    // Replace each placeholder with its corresponding value from the replacements object
    for (let placeholder in lessonContent) {
        if (lessonContent.hasOwnProperty(placeholder)) {
            if (placeholder === 'completionChecklist' || placeholder === 'keyTermsAndDefinitions') {
                let itemsArray = lessonContent[placeholder].split('|').map(item => {
                    item = item.trim();
                    if (item[item.length - 1] !== '.') {
                        item += '.';
                    }
                    return item;
                });

                let tables = body.getTables();
                let targetCell;
                // Find the cell containing the placeholder
                targetCell = updateTable(tables, placeholder, targetCell, itemsArray);
            } else {
                body.replaceText('{{' + placeholder + '}}', lessonContent[placeholder]);
            }
        }
    }
    let footerReplacementText = `U${lessonContent.unit} P${lessonContent.period} ${lessonContent.title} ${lessonContent.mainTopic}`;
    footer.replaceText('{{footer}}', footerReplacementText);
    header.replaceText('{{title}}', activityFilename);
    Logger.log(`Copied ${activityFilename} with ID: ${copy.getId()}`);
    updateCompleted(lessonContent.id, 'lessonPlanCreated', SHEETSDB.activityContent, true);
}