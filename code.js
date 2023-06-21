"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Define the page names
const newPages = [
    '🚧 - Task or feature name',
    '─────────────',
    '🧩 - Components',
    '📐 - Specs',
    '─────────────',
    '🧠 - Moodboard',
    '💡 - Ideas',
    '☣️ -  Discarded',
    '─────────────',
    'Cover'
];
figma.showUI(__html__);
const listPages = [''];
function updatePages() {
    var existingPages = figma.root.children; //Get the updated list of pages
    console.log('updating...');
    for (var index_page = 0; index_page < existingPages.length; index_page++) {
        listPages.push(existingPages[index_page].name);
    }
}
function createPages_() {
    console.log('Booting the crane 🏗 ...');
    for (var i = 0; i < newPages.length; i++) {
        if (listPages.indexOf(newPages[i]) < 0) {
            const page = figma.createPage();
            page.name = newPages[i];
            console.log(newPages[i] + ' created');
        }
        else {
            console.log(newPages[i] + " exits skipping..");
        }
    }
}
figma.ui.onmessage = (event) => __awaiter(void 0, void 0, void 0, function* () {
    if (event.type === 'createPages') {
        updatePages();
        createPages_();
    }
    figma.closePlugin();
});
