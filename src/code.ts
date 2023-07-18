const courseSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
const scripting_docs = courseSpreadsheet.getSheetByName('scripting_docs');
const lessonDetailsTab = courseSpreadsheet.getSheetByName('lesson_details');
const promptDetailsTab = courseSpreadsheet.getSheetByName('prompt_details');

function onOpen() {
    var ui = SpreadsheetApp.getUi();
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

function createResources(docType: string) {
    const records = getAllNewRecords();

    if (docType === 'documents') {
        const newRecords = records.filter(object => object.doc_created !== true);
        newRecords.forEach((document_content) => {
            createActivityDocument(document_content);
        });
    } else if (docType === 'slides') {
        const newRecords = records.filter(object => object.slide_created !== true);
        newRecords.forEach((slides_content) => {
            createActivitySlide(slides_content);
        });
    }
    else if (docType === 'all') {
        records.forEach((record, index) => {
            if (record.doc_created !== true) {
                createActivityDocument(record);
            }
            // Introduce a delay after creating a document
            Utilities.sleep(300);

            if (record.slide_created !== true) {
                createActivitySlide(record);
            }
            // Introduce a delay after creating a slide
            // But don't sleep after the last record
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

// open the current sheet and get the tab by name
const scriptingTab = courseSpreadsheet.getSheetByName('scripting_docs');
let cs50sheetValues = scriptingTab.getDataRange().getValues();

// get the list of of values for the documents
function getAllNewRecords() {
    // get the column number for the doc_created column
    let colNumDoc = cs50sheetValues[0].findIndex((col) => col === 'doc_created');
    let colNumSlide = cs50sheetValues[0].findIndex((col) => col === 'slide_created');
    // check if the columns were found
    if (colNumDoc === -1 || colNumSlide === -1) {
        throw new Error('doc_created or slide_created column not found');
    }

    // get the records from the sheet
    const newRecords = cs50sheetValues.filter(record => (record[colNumDoc] !== true || record[colNumSlide] !== true));

    // create an array of objects from the records
    const records = arrayOfObj(newRecords);
    // for each record if the key value for created is not true then add the record to the list
    // should be the same as the filter above
    const placeholders = records.filter(object => object.doc_created !== true || object.slide_created !== true);
    // return the list of records
    Logger.log(placeholders);
    return placeholders;
}

function updateCompleted(rowID: string, colID: string, tabName: GoogleAppsScript.Spreadsheet.Sheet, cellValue: boolean) {
    // get the current values of sheetName
    let sheetValues = tabName.getDataRange().getValues();
    // get the row number for a value in the first column of a 2d array
    let rowNum = sheetValues.findIndex((row) => row[0] === rowID);
    // get the column number for a value in the first row of a 2d array
    let colNum = sheetValues[0].findIndex((col) => col === colID);
    // update the value of the cell
    tabName.getRange(rowNum + 1, colNum + 1).setValue(cellValue);
}

function updateTable(tables: GoogleAppsScript.Document.Table[], placeholder: string, targetCell: any, arr: string[]) {
    for (let i = 0; i < tables.length; i++) {
        let rows = tables[i].getNumRows();
        for (let j = 0; j < rows; j++) {
            let row = tables[i].getRow(j);
            let cells = row.getNumCells();
            for (let k = 0; k < cells; k++) {
                let cell = row.getCell(k);
                if (cell.getText().indexOf('{{' + placeholder + '}}') > -1) {
                    targetCell = cell;
                    break;
                }
            }
            if (targetCell) {
                break;
            }
        }
        if (targetCell) {
            break;
        }
    }

    // If we found the cell
    if (targetCell) {
        var targetRow = targetCell.getParentRow();
        var targetTable = targetRow.getParentTable();
        var rowIndex = targetTable.getChildIndex(targetRow);

        // Replace placeholder with first list item
        targetCell.setText(arr[0]);

        // Add new rows for each remaining list item
        for (var i = 1; i < arr.length; i++) {
            var newRow = targetTable.insertTableRow(rowIndex + i);
            var leftCellCopy = targetRow.getCell(0).copy(); // Create a new copy for each iteration
            newRow.appendTableCell(leftCellCopy); // Left column
            newRow.appendTableCell(arr[i]); // Right column
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

function arrayOfObj(newRecords: any[][]) {
    const [keys, ...rows] = newRecords;
    const objects = rows.map(row => {
        return row.reduce((object, value, index) => {
            object[keys[index]] = value;
            return object;
        }, {});
    });
    return objects;
}