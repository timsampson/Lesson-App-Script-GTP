function createActivitySlide(slides_content) {
    const slideTemplateID = "1p44YQJ8kRWToz2racG-mYlurWMMFl1MdlD6HOFOJNBg";
    const slideTemplate = DriveApp.getFileById(slideTemplateID);
    let activity_filename = (`U${slides_content.unit} ~ Period ${slides_content.period} ~ ${slides_content.title} ~ ${slides_content.main_topic}`);
    let parentFolder = slideTemplate.getParents().next();
    let copy = slideTemplate.makeCopy(activity_filename, parentFolder);
    // Get the document by ID
    let presentation = SlidesApp.openById(copy.getId());
    let presentationId = presentation.getId();
    let lectureVideoElement;

    let pageWidth = presentation.getPageWidth();
    let videoWidth = 480;
    let videoHeight = 270;
    let videoLeft = (pageWidth - videoWidth) / 2;
    let videoTop = 40;

    try {
        lectureVideoElement = presentation.getSlides()[5].insertVideo(slides_content.video_lecture, videoLeft, videoTop, videoWidth, videoHeight); // This gets the 6th 
        let lectureVideoObjectId = lectureVideoElement.getObjectId();
    }
    catch (error) {
        Logger.log(`Error inserting video: ${error}`);
        presentation.getSlides()[5].insertTextBox('Video could not be inserted.', videoLeft, videoTop, videoWidth, videoHeight);
    }
    try {
        presentation.getSlides()[6].insertVideo(slides_content.video_topic, videoLeft, videoTop, videoWidth, videoHeight); // This gets the 7th slide
    } catch (error) {
        Logger.log(`Error inserting video: ${error}`);
        presentation.getSlides()[6].insertTextBox('Video could not be inserted.', videoLeft, videoTop, videoWidth, videoHeight);
    }

    presentation.getSlides().forEach(function (slide) {
        slide.getPageElements().forEach((pageElement) => {
            if (pageElement.getPageElementType() === SlidesApp.PageElementType.SHAPE) {
                const shape = pageElement.asShape();
                const textRange = shape.getText();
                if (textRange) {  // check if the TextRange is not null
                    for (const key in slides_content) {
                        if (slides_content.hasOwnProperty(key)) {
                            const placeholder = `{{${key}}}`;
                            let replacement = slides_content[key];

                            // if the key is 'completion_checklist' or 'key_terms_and_definitions', replace '|' with '\n'
                            if (key === 'completion_checklist' || key === 'key_terms_and_definitions') {
                                replacement = processText(replacement);
                            }

                            textRange.replaceAllText(placeholder, replacement);
                        }
                    }
                }
            }
        });
    });
    Logger.log(`Copied ${activity_filename} with ID: ${copy.getId()}`);
    updateCompleted(slides_content.id, 'slide_created', scripting_docs, true);
}

function processText(input: string) {
    // Split the string into an array of substrings at each '|'
    let lines = input.split('|');

    // Trim whitespace from each line, ensure it ends with a period and a space, and join them back together with newlines
    let output = lines.map((line: string) => {
        line = line.trim();
        if (line[line.length - 1] !== '.') {
            line += '.';
        }
        return '• ' + line + ' ';
    }).join('\n');

    return output;
}