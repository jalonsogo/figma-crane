// Default layout structure
interface LayoutItem {
  emoji: string;
  label: string;
  type?: 'separator' | 'page';
}

// Default layout data
let defaultLayout: LayoutItem[] = [
  { emoji: '🚧', label: 'Task or feature name', type: 'page' },
  { emoji: '─', label: '─────────────', type: 'separator' },
  { emoji: '🧩', label: 'Components', type: 'page' },
  { emoji: '📐', label: 'Specs', type: 'page' },
  { emoji: '─', label: '─────────────', type: 'separator' },
  { emoji: '🧠', label: 'Moodboard', type: 'page' },
  { emoji: '💡', label: 'Ideas', type: 'page' },
  { emoji: '☣️', label: 'Discarded', type: 'page' },
  { emoji: '─', label: '─────────────', type: 'separator' },
  { emoji: '📄', label: 'Cover', type: 'page' }
];

figma.showUI(__html__, { width: 320, height: 500 });

function updateExistingPages(): string[] {
    const existingPages = figma.root.children;
    console.log('Checking existing pages...');
    return existingPages.map(page => page.name);
}

function createPagesFromLayout(layoutData: LayoutItem[]) {
  console.log('🏗 Starting Crane scaffold...');
  const existingPageNames = updateExistingPages();
  
  for (const layoutItem of layoutData) {
    let pageName: string;
    
    if (layoutItem.type === 'separator') {
      pageName = '---';
    } else {
      pageName = layoutItem.emoji + ' - ' + layoutItem.label;
    }
    
    if (existingPageNames.indexOf(pageName) < 0) {
      const page = figma.createPage();
      page.name = pageName;
      console.log(`✅ Created: ${pageName}`);
    } else {
      console.log(`⏭ Skipped existing: ${pageName}`);
    }
  }
  console.log('🎉 Scaffold complete!');
}

function saveLayoutData(layoutData: LayoutItem[]) {
  // Save to plugin data for persistence
  figma.root.setPluginData('craneLayout', JSON.stringify(layoutData));
  console.log('💾 Layout saved to plugin data');
  
  // Show success message
  figma.notify('Layout saved successfully!');
}

function loadLayoutData(): LayoutItem[] {
  const savedData = figma.root.getPluginData('craneLayout');
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error('Failed to parse saved layout data:', e);
    }
  }
  return defaultLayout;
}

figma.ui.onmessage = async (event) => {
  switch (event.type) {
    case 'createPages':
      const layoutToCreate = event.layoutData || defaultLayout;
      createPagesFromLayout(layoutToCreate);
      figma.closePlugin();
      break;
      
    case 'saveLayout':
      if (event.layoutData) {
        saveLayoutData(event.layoutData);
      }
      break;
      
    case 'loadLayout':
      const savedLayout = loadLayoutData();
      figma.ui.postMessage({
        type: 'layoutLoaded',
        layoutData: savedLayout
      });
      break;
      
    case 'getExistingPages':
      const existingPages = updateExistingPages();
      figma.ui.postMessage({
        type: 'existingPagesLoaded',
        existingPages: existingPages
      });
      break;
      
    default:
      console.log('Unknown message type:', event.type);
  }
}