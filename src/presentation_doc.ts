function createActivitySlide(lessonContent: LessonContent) {
    const slideTemplateID = "1p44YQJ8kRWToz2racG-mYlurWMMFl1MdlD6HOFOJNBg";
    const slideTemplate = DriveApp.getFileById(slideTemplateID);
    let activityFilename = (`U${lessonContent.unit}P${lessonContent.period} Presentation ${lessonContent.title} ~ ${lessonContent.mainTopic}`);
    let parentFolder = slideTemplate.getParents().next();
    let copy = slideTemplate.makeCopy(activityFilename, parentFolder);
    // Get the document by ID
    let presentation = SlidesApp.openById(copy.getId());

    let pageWidth = presentation.getPageWidth();
    let videoWidth = 480;
    let videoHeight = 270;
    let videoLeft = (pageWidth - videoWidth) / 2;
    let videoTop = 40;

    let topicSlideVideoOne = presentation.getSlides()[5];
    let topicSlideVideoTwo = presentation.getSlides()[6];
    let exitTrueFalseAKSlide = presentation.getSlides()[10];
    let exitEssentialQuestionAKFalseSlide = presentation.getSlides()[11];
    exitTrueFalseAKSlide.setSkipped(true);
    exitEssentialQuestionAKFalseSlide.setSkipped(true);

    try {
        topicSlideVideoOne.insertVideo(lessonContent.videoLecture, videoLeft, videoTop, videoWidth, videoHeight); // This gets the 6th 
    }
    catch (error) {
        Logger.log(`Error inserting video: ${error}`);
        topicSlideVideoOne.insertTextBox('Insert video or if not needed, delete this slide.', videoLeft, videoTop, videoWidth, videoHeight);
        topicSlideVideoOne.setSkipped(true); // Hide the slide if no video provided
    }
    // Insert topic video on the 7th slide

    try {
        topicSlideVideoTwo.insertVideo(lessonContent.videoTopic, videoLeft, videoTop, videoWidth, videoHeight);
    } catch (error) {
        Logger.log(`Error inserting topic video: ${error}`);
        topicSlideVideoTwo.insertTextBox('Insert video or if not needed, delete this slide.', videoLeft, videoTop, videoWidth, videoHeight);
        topicSlideVideoTwo.setSkipped(true); // Hide the slide if no video provided
    }

    presentation.getSlides().forEach(function (slide) {
        slide.getPageElements().forEach((pageElement) => {
            if (pageElement.getPageElementType() === SlidesApp.PageElementType.SHAPE) {
                const shape = pageElement.asShape();
                const textRange = shape.getText();
                if (textRange) {  // check if the TextRange is not null
                    for (const key in lessonContent) {
                        if (lessonContent.hasOwnProperty(key)) {
                            const placeholder = `{{${key}}}`;
                            let replacement = lessonContent[key];

                            // if the key is 'completionChecklist' or 'keyTermsAndDefinitions', replace '|' with '\n'
                            if (key === 'completionChecklist' || key === 'keyTermsAndDefinitions') {
                                replacement = processText(replacement);
                            }

                            textRange.replaceAllText(placeholder, replacement);
                        }
                    }
                }
            }
        });
    });
    Logger.log(`Copied ${activityFilename} with ID: ${copy.getId()}`);
    updateCompleted(lessonContent.id, 'slideCreated', SHEETSDB.activityContent, true);
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