const LPSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
const SHEETSDB = {
    lessonSequence: LPSpreadsheet.getSheetByName('lesson_sequence'),
    activityContent: LPSpreadsheet.getSheetByName('activity_content'),
    promptDetails: LPSpreadsheet.getSheetByName('prompt_details'),
};
/**
 * Adds a custom menu to the Google Sheets UI.
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Create Resources')
        .addItem('Create Docs and Slides', 'createAll')
        .addSeparator()
        .addItem('Create Documents', 'createDocuments')
        .addSeparator()
        .addItem('Create Slides', 'createSlides')
        .addSeparator()
        .addItem('Create LP Details', 'processLessonPlans')
        .addToUi();
}

/**
 * Creates resources based on the specified document type.
 * @param {string} docType - The type of document to create ('documents', 'slides', 'all').
 */
function createResources(docType: string) {
    const records = getAllNewRecords();

    if (docType === 'documents') {
        const newRecords = records.filter(object => object.doc_created !== true);
        newRecords.forEach(document_content => {
            createActivityDocument(document_content);
        });
    } else if (docType === 'slides') {
        const newRecords = records.filter(object => object.slide_created !== true);
        newRecords.forEach(slides_content => {
            createActivitySlide(slides_content);
        });
    } else if (docType === 'all') {
        records.forEach((record, index) => {
            if (record.doc_created !== true) {
                createActivityDocument(record);
            }
            Utilities.sleep(300);

            if (record.slide_created !== true) {
                createActivitySlide(record);
            }
            if (index < records.length - 1) {
                Utilities.sleep(300);
            }
        });
    } else {
        throw new Error('Invalid document type');
    }
}

function createDocuments() {
    createResources('documents');
}

function createSlides() {
    createResources('slides');
}

function createAll() {
    createResources('all');
}

/**
 * Gets all new records from the    activityContent: LPSpreadsheet.getSheetByName('activity_content'),
 sheet.
 * @returns {Array<worksheet_content>} An array of new records.
 */
function getAllNewRecords(): Array<worksheet_content> {
    const activityRecords = SHEETSDB.activityContent.getDataRange().getValues();
    const colNumDoc = activityRecords[0].findIndex(col => col === 'doc_created');
    const colNumSlide = activityRecords[0].findIndex(col => col === 'slide_created');

    if (colNumDoc === -1 || colNumSlide === -1) {
        throw new Error('doc_created or slide_created column not found');
    }

    const newRecords = activityRecords.filter(record => (record[colNumDoc] !== true || record[colNumSlide] !== true));
    const records = arrayOfObj(newRecords);
    const placeholders = records.filter(object => object.doc_created !== true || object.slide_created !== true);

    Logger.log(placeholders);
    return placeholders;
}

/**
 * Updates the completion status of a record in the specified sheet.
 * @param {string} rowID - The ID of the row to update.
 * @param {string} colID - The ID of the column to update.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} tabName - The sheet to update.
 * @param {boolean} cellValue - The value to set in the cell.
 */
function updateCompleted(rowID: string, colID: string, tabName: GoogleAppsScript.Spreadsheet.Sheet, cellValue: boolean) {
    const sheetValues = tabName.getDataRange().getValues();
    const rowNum = sheetValues.findIndex(row => row[0] === rowID);
    const colNum = sheetValues[0].findIndex(col => col === colID);
    tabName.getRange(rowNum + 1, colNum + 1).setValue(cellValue);
}

/**
 * Updates a table in a Google Document with the specified placeholder and array values.
 * @param {GoogleAppsScript.Document.Table[]} tables - The tables to update.
 * @param {string} placeholder - The placeholder text to replace.
 * @param {any} targetCell - The target cell to update.
 * @param {string[]} arr - The array of values to insert.
 * @returns {any} The updated target cell.
 */
function updateTable(tables: GoogleAppsScript.Document.Table[], placeholder: string, targetCell: any, arr: string[]) {
    for (const table of tables) {
        const rows = table.getNumRows();
        for (let j = 0; j < rows; j++) {
            const row = table.getRow(j);
            const cells = row.getNumCells();
            for (let k = 0; k < cells; k++) {
                const cell = row.getCell(k);
                if (cell.getText().includes(`{{${placeholder}}}`)) {
                    targetCell = cell;
                    break;
                }
            }
            if (targetCell) break;
        }
        if (targetCell) break;
    }

    if (targetCell) {
        const targetRow = targetCell.getParentRow();
        const targetTable = targetRow.getParentTable();
        const rowIndex = targetTable.getChildIndex(targetRow);

        targetCell.setText(arr[0]);

        for (let i = 1; i < arr.length; i++) {
            const newRow = targetTable.insertTableRow(rowIndex + i);
            const leftCellCopy = targetRow.getCell(0).copy();
            newRow.appendTableCell(leftCellCopy);
            newRow.appendTableCell(arr[i]);
        }
    }
    return targetCell;
}

type worksheet_content = {
    id: string,
    unit: string,
    title: string,
    main_topic: string,
    period: string,
    introduction: string,
    lecture_video: string,
    topic_video_title: string,
    lecture_video_title: string,
    topic_video: string,
    learning_objective_1: string,
    learning_objective_2: string,
    warm_up: string,
    key_terms_and_definitions: string,
    essential_question: string,
    true_or_false_question: string,
    end_of_lesson_quiz: string,
    next_lesson_preview: string,
    ak_for_essential_question: string,
    k_true_false: string,
    completion_checklist: string,
    doc_created: boolean,
    slide_created: boolean
}

/**
 * Converts a 2D array of records into an array of objects.
 * @param {any[][]} newRecords - The 2D array of records.
 * @returns {Array<worksheet_content>} An array of objects representing the records.
 */
function arrayOfObj(newRecords: any[][]): Array<worksheet_content> {
    const [keys, ...rows] = newRecords;
    return rows.map(row => {
        return row.reduce((object, value, index) => {
            object[keys[index]] = value;
            return object;
        }, {} as worksheet_content);
    });
}
