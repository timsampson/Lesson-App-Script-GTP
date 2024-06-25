const LPSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

const SHEETSDB: {
    lessonSequence: GoogleAppsScript.Spreadsheet.Sheet | null,
    activityContent: GoogleAppsScript.Spreadsheet.Sheet | null,
    promptDetails: GoogleAppsScript.Spreadsheet.Sheet | null
} = {
    lessonSequence: LPSpreadsheet.getSheetByName('lesson_sequence'),
    activityContent: LPSpreadsheet.getSheetByName('lesson_content'),
    promptDetails: LPSpreadsheet.getSheetByName('prompt_details'),
};

/**
 * Adds a custom menu to the Google Sheets UI.
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Create Resources 🎨')
        .addItem('📚 Create All Resources', 'createAll')
        .addSeparator()
        .addItem('📕 Create Activity Documents', 'createDocuments')
        .addSeparator()
        .addItem('📗 Create Slides', 'createSlides')
        .addSeparator()
        .addItem('📘 Create Lesson Plans', 'createLessonPlans')
        .addSeparator()
        .addItem('🤖 Process Lesson Content', 'processLessonContent')
        .addToUi();
}

/**
 * Creates documents by calling the createResources function with 'documents' as the argument.
 */
function createDocuments() {
    createResources('documents');
}

/**
 * Creates slides by calling the createResources function with 'slides' as the argument.
 */
function createSlides() {
    createResources('slides');
}

/**
 * Creates slides by calling the createResources function with 'slides' as the argument.
 */
function createLessonPlans() {
    createResources('lessonPlans');
}
/**
 * Creates all resources (documents, slides and lesson plans) by calling the createResources function with 'all' as the argument.
 */
function createAll() {
    createResources('all');
}

/**
 * Creates resources based on the specified document type.
 * @param {string} docType - The type of document to create ('documents', 'slides', lessonPlans, 'all').
 */
function createResources(docType: string) {
    const records: LessonContent[] = getAllActivityRecords();

    if (docType === 'documents') {
        const newRecords = records.filter(object => object.activityDocCreated !== true);
        newRecords.forEach(lessonContent => {
            createActivityDocument(lessonContent);
        });
    } else if (docType === 'slides') {
        const newRecords = records.filter(object => object.slideCreated !== true);
        newRecords.forEach(lessonContent => {
            createActivitySlide(lessonContent);
        });
    } else if (docType === 'lessonPlans') {
        const newRecords = records.filter(object => object.lessonPlanCreated !== true);
        newRecords.forEach(lessonContent => {
            createLessonPlan(lessonContent);
        });

    } else if (docType === 'all') {
        records.forEach((record: LessonContent, index) => {
            if (record.activityDocCreated !== true) {
                createActivityDocument(record);
            }
            Utilities.sleep(300);

            if (record.slideCreated !== true) {
                createActivitySlide(record);
            }
            Utilities.sleep(300);

            if (record.lessonPlanCreated !== true) {
                createLessonPlan(record);
            }
            if (index < records.length - 1) {
                Utilities.sleep(300);
            }
        });
    } else {
        throw new Error('Invalid document type');
    }
}

/**
 * Gets all new records from the activityContent sheet.
 * @returns {Array<LessonContent>} An array of new records.
 */
function getAllActivityRecords(): Array<LessonContent> {
    const activityRecords = SHEETSDB.activityContent.getDataRange().getValues();

    // Convert the 2D array into an array of objects
    const records: LessonContent[] = arrayOfObj(activityRecords);

    // Filter the records where docCreated or slideCreated is not true
    const newRecords = records.filter(record => !record.activityDocCreated || !record.slideCreated || !record.lessonPlanCreated);

    return newRecords;
}

/**
 * Updates the completion status of a record in the specified sheet.
 * @param {string} rowID - The ID of the row to update.
 * @param {string} colID - The ID of the column to update.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} tabName - The sheet to update.
 * @param {boolean} cellValue - The value to set in the cell.
 */
function updateCompleted(rowID: string, colID: string, tabName: GoogleAppsScript.Spreadsheet.Sheet, cellValue: any) {
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
function updateTable(tables: GoogleAppsScript.Document.Table[], placeholder: string, targetCell: any, arr: string[]): any {
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

/**
 * Converts a 2D array of records into an array of objects.
 * @param {any[][]} newRecords - The 2D array of records.
 * @returns {Array<T>} An array of objects representing the records.
 */
function arrayOfObj<T>(newRecords: any[][]): Array<T> {
    const [keys, ...rows] = newRecords;
    return rows.map(row => {
        return row.reduce((object, value, index) => {
            object[keys[index]] = value;
            return object;
        }, {} as T);
    });
}
