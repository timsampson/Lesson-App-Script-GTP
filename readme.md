# LessonBuilder, GAPS and GTP: Automating Lesson Document Creation

LessonBuilder is a Google Apps Script application designed to dramatically reduce the time and effort required to create high-quality lesson materials. By harnessing the capabilities of advanced Large Language Models (LLMs), LessonBuilder automates the generation of comprehensive lesson plans, engaging student activity documents, and visually appealing slide presentations.

**Here's how LessonBuilder simplifies your workflow:**

1. **Concise Lesson Summaries:** Begin by inputting a brief overview of your lesson into a structured Google Sheet. Include essential details like the unit, topic, learning objectives, key concepts, and relevant AP Computer Science standards.

2. **AI-Powered Content Creation:** LessonBuilder's intelligent system, powered by a sophisticated LLM, analyzes your input and automatically generates:

   - **Thorough Lesson Plans:** Receive well-organized lesson plans that incorporate timings, warm-up activities, essential questions, key terms, differentiation strategies, assessment ideas, and answer keys.
   - **Engaging Activity Documents:** Provide your students with structured worksheets that include thought-provoking questions, interactive exercises, space for reflection, and clearly defined learning goals.
   - **Dynamic Slide Presentations:** Utilize visually engaging presentations featuring key takeaways, relevant visuals, embedded videos (if URLs are provided), and a cohesive flow of information.

3. **Tailored to Your Classroom:** Review and easily customize the generated content to align with your unique teaching style, curriculum requirements, and the specific needs of your students.

**Key Features:**

- **AI-Driven Content Generation:** Significantly reduces lesson planning time by automating the creation of high-quality educational materials.
- **Customizable Templates:** Modify generated content to match your preferred formats and classroom needs.
- **Seamless Google Workspace Integration:** Enjoy a smooth and efficient workflow with direct integration within Google Sheets, Docs, and Slides.
- **Increased Efficiency & Focus:** Devote more time to teaching and student interaction by offloading repetitive aspects of lesson preparation.

**Example Input (Google Sheet):**

| Unit | Title     | Period  | Main Topic                            | Sub Topics                                               | AP Objectives                                                                                  | ... |
| ---- | --------- | ------- | ------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --- |
| 10   | Recursion | 3 of 10 | 10.2. Recursive Searching and Sorting | "10.2.1. Recursive Binary Search 10.2.2. Merge Sort ..." | "CON-2.P: Apply recursive search algorithms... CON-2.Q: Apply recursive algorithms to sort..." |     |

**LessonBuilder takes care of the rest, providing you with fully formed documents, ready for your final review!**

## Summary by Gemini 1.5 Pro

I uploaded the folder and asked Gemini to analyze the files and provide an overview. I think it is did a reasonable job. Below is it's analysis of the workflow.

## File Breakdown and Data Flow Analysis

This project automates lesson plan creation using Google Apps Script and a Large Language Model (LLM). Here's a breakdown of the files and their functions:

**1. `src/code.ts` (Main Entry Point):**

- **Data:** Reads data from `lesson_sequence` and `lesson_content` sheets.
- **UI:** Sets up the custom menu in Google Sheets for user interaction.
- **Orchestration:**
  - `onOpen()`: Initializes the custom menu on spreadsheet open.
  - `createDocuments()`, `createSlides()`, `createLessonPlans()`, `createAll()`: Trigger functions for specific resource creation or all resources.
  - `createResources(docType)`: Main function that filters records based on `docType` and calls the corresponding creation functions.
  - `getAllActivityRecords()`: Retrieves all lesson content records from the sheet that haven't been fully processed.
  - `updateCompleted(rowID, colID, tabName, cellValue)`: Marks a specific record as processed in the sheet.
  - `updateTable(tables, placeholder, targetCell, arr)`: Helper function to find and populate tables in Google Docs with provided data.
  - `arrayOfObj(newRecords)`: Converts 2D arrays from Sheets into an array of objects for easier manipulation.

**2. `src/gpt.ts` (LLM Interaction):**

- **Data:** Reads from `prompt_details` sheet and `lesson_sequence` sheet.
- **LLM Calls:**
  - `getPromptObjDetails()`: Retrieves prompt details (model, API key, prompt structure) from the spreadsheet.
  - `processLessonContent()`: Iterates through unprocessed lesson summaries, calls the LLM to generate content, and updates the sheet.
  - `generateLessonContent(lessonPlanSummary)`: Constructs and sends the API request to the LLM based on prompt details and lesson summary. Processes the response, extracts JSON data, and writes it back to the `activityContent` sheet.
- **Data Writing:**
  - `writeDataToSheet(data)`: Writes the LLM-generated content into the `activityContent` sheet.
- **Data Fetching:**
  - `getLessonDetailsFromTab()`: Fetches unprocessed lesson summaries from the `lesson_sequence` sheet.

**3. `src/activity_doc.ts` (Activity Document Generation):**

- **Data:** Takes a `LessonContent` object as input.
- **Document Manipulation:**
  - `createActivityDocument(documentContent)`: Creates a new Google Doc from a template, populates it with data from `documentContent`, and updates the record status and link.

**4. `src/presentation_doc.ts` (Slide Generation):**

- **Data:** Takes a `LessonContent` object as input.
- **Slide Manipulation:**
  - `createActivitySlide(documentContent)`: Creates a new Google Slides presentation from a template, adds videos if provided, populates placeholders, updates the record status and link.
  - `processText(input)`: Helper function to format text appropriately for slides (e.g., bullet points).

**5. `src/lesson_plan_doc.ts` (Lesson Plan Generation):**

- **Data:** Takes a `LessonContent` object as input.
- **Document Manipulation:**
  - `createLessonPlan(documentContent)`: Creates a new Google Doc from a template, populates it with data from `documentContent`, and updates the record status and link.

**6. `src/types.ts` (Data Structure Definitions):**

- Defines TypeScript interfaces to ensure type safety and code clarity:
  - `LessonSequence`: Represents a row in the `lesson_sequence` sheet.
  - `LessonContent`: Represents a row in the `lesson_content` sheet.
  - `PromptDetailsObj`: Represents a row in the `prompt_details` sheet.

**Data Flow:**

1. **User Input:** User enters lesson summaries in the `lesson_sequence` sheet.
2. **LLM Processing:** `processLessonContent()` reads summaries, sends them to the LLM, and writes generated content to `lesson_content`.
3. **Resource Generation:**
   - `createResources()` reads from `lesson_content` and triggers creation functions.
   - Document, slide, and lesson plan generation functions create and populate respective files, updating links and status in `lesson_content`.

**Key Observations:**

- **Modularity:** Well-organized code with separate files for different functionalities.
- **Data-Driven:** Relies heavily on Google Sheets for both input and storing generated data.
- **Scalability:** Designed to process multiple lesson summaries efficiently.
- **Testability:** TypeScript interfaces make unit testing easier.
