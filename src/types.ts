// id	week	unit	title	period	mainTopic	apObjectives	enduringUnderstanding	suggestedskills	bigIdeaQuiz	previousLessonTopic	nextLessonTopic	summary	processed
type LessonSequence = {
    id: string;
    week: string;
    unit: string;
    title: string;
    period: string;
    mainTopic: string;
    apObjectives: string;
    enduringUnderstanding: string;
    suggestedSkills: string;
    bigIdeaQuiz: string;
    previousLessonTopic: string;
    nextLessonTopic: string;
    summary: string;
    processed: boolean;
};

// id	unit	title	period	mainTopic	introduction	learningObjectiveOne	learningObjectiveTwo	warmUp	keyTermsAndDefinitions	essentialQuestion	trueOrFalseQuestion	endOfLessonQuiz	nextLessonPreview	akEssentialQuestion	akTrueFalse	completionChecklist	lectureVideoTitle	videoLecture	shortsVideoTitle	videoTopic	activityDocCreated	slideCreated	lessonPlanCreated
type LessonContent = {
    id: string;
    unit: string;
    title: string;
    period: string;
    mainTopic: string;
    introduction: string;
    learningObjectiveOne: string;
    learningObjectiveTwo: string;
    warmUp: string;
    keyTermsAndDefinitions: string;
    essentialQuestion: string;
    trueOrFalseQuestion: string;
    endOfLessonQuiz: string;
    nextLessonPreview: string;
    akEssentialQuestion: string;
    akTrueFalse: string;
    completionChecklist: string;
    lectureVideoTitle: string;
    videoLecture: string;
    shortsVideoTitle: string;
    videoTopic: string;
    activityDocCreated: boolean;
    slideCreated: boolean;
    lessonPlanCreated: boolean;
};

type PromptDetailsObj = {
    modelEndpoint: string,
    promptRole: string,
    promptDetails: string,
    promptFormat: string,
    promptStructure: string
}

/**
 * @typedef {Object} PromptDetailsObj
 * @property {string} modelEndpoint - The model endpoint.
 * @property {string} promptRole - The role of the prompt.
 * @property {string} promptDetails - The details of the prompt.
 * @property {string} promptFormat - The format of the prompt.
 * @property {string} promptStructure - The structure of the prompt.
 */
/**
 * Represents the lesson sequence structure.
 * 
 * @typedef {Object} LessonSequence
 * @property {string} id - The unique identifier of the lesson sequence.
 * @property {string} week - The week number of the lesson sequence.
 * @property {string} unit - The unit number of the lesson sequence.
 * @property {string} title - The title of the lesson sequence.
 * @property {string} period - The period of the lesson sequence.
 * @property {string} mainTopic - The main topic of the lesson sequence.
 * @property {string} apObjectives - The AP objectives of the lesson sequence.
 * @property {string} enduringUnderstanding - The enduring understanding of the lesson sequence.
 * @property {string} suggestedSkills - The suggested skills of the lesson sequence.
 * @property {string} bigIdeaQuiz - The big idea quiz of the lesson sequence.
 * @property {string} previousLessonTopic - The previous lesson topic.
 * @property {string} nextLessonTopic - The next lesson topic.
 * @property {string} summary - The summary of the lesson sequence.
 * @property {boolean} processed - Indicates if the lesson sequence has been processed.
 */

/**
 * Represents the lesson content structure.
 * 
 * @typedef {Object} LessonContent
 * @property {string} id - The unique identifier of the lesson content.
 * @property {string} unit - The unit number of the lesson content.
 * @property {string} title - The title of the lesson content.
 * @property {string} period - The period of the lesson content.
 * @property {string} mainTopic - The main topic of the lesson content.
 * @property {string} introduction - The introduction of the lesson content.
 * @property {string} learningObjectiveOne - The first learning objective of the lesson content.
 * @property {string} learningObjectiveTwo - The second learning objective of the lesson content.
 * @property {string} warmUp - The warm-up activity of the lesson content.
 * @property {string} keyTermsAndDefinitions - The key terms and definitions of the lesson content.
 * @property {string} essentialQuestion - The essential question of the lesson content.
 * @property {string} trueOrFalseQuestion - The true or false question of the lesson content.
 * @property {string} endOfLessonQuiz - The end-of-lesson quiz of the lesson content.
 * @property {string} nextLessonPreview - The preview of the next lesson.
 * @property {string} akEssentialQuestion - The answer key for the essential question.
 * @property {string} akTrueFalse - The answer key for the true or false question.
 * @property {string} completionChecklist - The completion checklist of the lesson content.
 * @property {string} lectureVideoTitle - The title of the lecture video.
 * @property {string} videoLecture - The URL of the video lecture.
 * @property {string} shortsVideoTitle - The title of the shorts video.
 * @property {string} videoTopic - The topic of the video.
 * @property {boolean} docCreated - Indicates if the document has been created.
 * @property {boolean} slideCreated - Indicates if the slide has been created.
 * @property {boolean} lessonPlanCreated - Indicates if the lesson plan has been created.
 */