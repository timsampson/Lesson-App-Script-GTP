
function createActivityDocument(document_content) {
    const activityTemplateID = "1hIsEy8fWHH1u7vEoTvPT80lqB9jK3Mvk-TERjfQ4G3E";
    const activityTemplate = DriveApp.getFileById(activityTemplateID);

    let activity_filename = (`U${document_content.unit} ~ Period ${document_content.period} ~ ${document_content.title} ~ ${document_content.main_topic}`);
    let parentFolder = activityTemplate.getParents().next();
    let copy = activityTemplate.makeCopy(activity_filename, parentFolder);
    // Get the document by ID
    let document = DocumentApp.openById(copy.getId());
    // Get the body of the document
    let body = document.getBody();
    let footer = document.getFooter();
    let header = document.getHeader();
    // Replace each placeholder with its corresponding value from the replacements object
    for (let placeholder in document_content) {
        if (placeholder === 'completion_checklist') {
            let arr = document_content[placeholder].split('|').map(item => {
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
        } else if (placeholder === 'key_terms_and_definitions') {
            let arr = document_content[placeholder].split('|').map(item => {
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
            body.replaceText('{{' + placeholder + '}}', document_content[placeholder]);
        }
    }
    let footerReplacementText = `U${document_content.unit} ~ Period ${document_content.period} ~ ${document_content.title} ~ ${document_content.main_topic}`;
    footer.replaceText('{{footer}}', footerReplacementText);
    header.replaceText('{{title}}', activity_filename);
    Logger.log(`Copied ${activity_filename} with ID: ${copy.getId()}`);
    updateCompleted(document_content.id, 'doc_created', SHEETSDB.activityContent, true);
}