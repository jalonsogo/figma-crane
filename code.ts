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
const listPages: any[] = [''];

function updatePages() {
    var existingPages = figma.root.children; //Get the updated list of pages
    console.log('updating...');
    for (var index_page=0; index_page<existingPages.length; index_page++) {
      listPages.push(existingPages[index_page].name);
    }
}

function createPages_() {
  console.log('Booting the crane 🏗 ...');
  for (var i=0; i<newPages.length; i++) {
    if (listPages.indexOf(newPages[i]) < 0) {
      const page = figma.createPage();
      page.name = newPages[i];
      console.log(newPages[i]+' created');
    } else {
      console.log(newPages[i]+" exits skipping..");
    }
  }
}

figma.ui.onmessage = async (event) => {
	if (event.type === 'createPages') {
    updatePages();
    createPages_();
	}
  figma.closePlugin();
}