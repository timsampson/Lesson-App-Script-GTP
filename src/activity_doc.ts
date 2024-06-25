
function createActivityDocument(documentContent: LessonContent) {
    const activityTemplateID = "1hIsEy8fWHH1u7vEoTvPT80lqB9jK3Mvk-TERjfQ4G3E";
    const activityTemplate = DriveApp.getFileById(activityTemplateID);

    let activity_filename = (`U${documentContent.unit}P${documentContent.period} Activity Document ${documentContent.title} ${documentContent.mainTopic}`);
    let parentFolder = activityTemplate.getParents().next();
    let copy = activityTemplate.makeCopy(activity_filename, parentFolder);
    let documentUrl = copy.getUrl();
    // Get the document by ID
    let document = DocumentApp.openById(copy.getId());
    // Get the body of the document
    let body = document.getBody();
    let footer = document.getFooter();
    let header = document.getHeader();
    // Replace each placeholder with its corresponding value from the replacements object
    for (let placeholder in documentContent) {
        if (placeholder === 'completionChecklist') {
            let arr = documentContent[placeholder].split('|').map(item => {
                item = item.trim();
                if (item[item.length - 1] !== '.') {
                    item += '.';
                }
                return item;
            });

            let tables = body.getTables();
            let targetCell;
            // Find the cell containing the placeholder
            targetCell = updateTable(tables, placeholder, targetCell, arr);
        } else if (placeholder === 'keyTermsAndDefinitions') {
            let arr = documentContent[placeholder].split('|').map(item => {
                item = item.trim();
                if (item[item.length - 1] !== '.') {
                    item += '.';
                }
                return item;
            });

            // Find the location of the placeholder in the body
            var foundElement = body.findText('{{' + placeholder + '}}');
            if (foundElement) {
                var foundText = foundElement.getElement().asText();
                var foundTextIndex = body.getChildIndex(foundText.getParent());

                // Replace the placeholder with the first item in the list
                foundText.setText(arr[0]);

                // Create the list with the remaining items
                for (var i = 1; i < arr.length; i++) {
                    body.insertListItem(foundTextIndex + i, arr[i])
                        .setGlyphType(DocumentApp.GlyphType.BULLET);
                }
            }
        } else {
            body.replaceText('{{' + placeholder + '}}', documentContent[placeholder]);
        }
    }
    let footerReplacementText = `U${documentContent.unit}P${documentContent.period} ${documentContent.mainTopic}`;
    footer.replaceText('{{footer}}', footerReplacementText);
    header.replaceText('{{title}}', activity_filename);
    Logger.log(`Copied ${activity_filename} with ID: ${copy.getId()}`);
    updateCompleted(documentContent.id, 'activityDocCreated', SHEETSDB.activityContent, true);
    updateCompleted(documentContent.id, 'activityLink', SHEETSDB.activityContent, documentUrl);

}