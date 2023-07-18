# Activity Plan and Slides Builder

## With GPT3 and Google Apps Script (GAPS)

As a summer project I wanted to get some experience with LLMs and see how they might help provide some content for lesson activities for CS subjects.

After many iterations and starting with simple prompts and lots of copy and pasting, I have a workflow that works consistently with a minimum amount of input while providing activity documents and lesson step slides will help add value to lesson delivery in class.

## Google Sheet tabs description

lesson_details: The content in this tab is read by Apps Script to provide input to GPT as the lessonPlanSummary.

scripting_docs: The content in this tab was returned by GPT and written by Appscript. The Youtube details need to be manually added.

prompt_details: The default content is used in the example.  It can be manually updated and is read by Apps Script to be used in the GTP API call.

[AP CSA Slides and Worksheet Automation](https://docs.google.com/presentation/d/e/2PACX-1vRYrz5f0cYkBOBVnPZv9dzlP8P0LfqJjdjEPF8dAR-C245YmOKjqVwJMFI2fB3KLfZBaleBi6NWhnrc/pub?start=true&loop=true&delayms=3000)

[Project Description Slide](https://docs.google.com/spreadsheets/d/1sajQ_lnGGOGlY9mBU11gvDbGgm56oClHZr45mptgNf4/edit#gid=1206459728)

[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)
