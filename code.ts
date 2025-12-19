// Default layout structure
interface LayoutItem {
  emoji: string;
  label: string;
  type?: 'separator' | 'page';
}

// Cover component settings for auto-insert feature
interface CoverComponentSettings {
  componentKey: string;       // Figma component key from URL
  enabled: boolean;           // Toggle for auto-insert
  componentName?: string;     // Cached name for preview display
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

async function createPagesFromLayout(layoutData: LayoutItem[]) {
  console.log('Starting Crane scaffold...');
  const existingPageNames = updateExistingPages();
  let coverPage: PageNode | null = null;

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
      console.log(`Created: ${pageName}`);

      // Track the Cover page if this is it
      if (layoutItem.label === 'Cover') {
        coverPage = page;
      }
    } else {
      console.log(`Skipped existing: ${pageName}`);
      // Also check existing pages for Cover
      if (layoutItem.label === 'Cover') {
        coverPage = figma.root.children.find(p => p.name === pageName) as PageNode || null;
      }
    }
  }

  // Auto-insert cover component if enabled and Cover page exists
  if (coverPage) {
    await insertCoverComponent(coverPage);
  }

  console.log('Scaffold complete!');
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

// Cover component settings functions - using clientStorage for global persistence
async function saveCoverComponentSettings(settings: CoverComponentSettings) {
  await figma.clientStorage.setAsync('craneCoverComponent', settings);
  console.log('Cover component settings saved globally');
}

async function loadCoverComponentSettings(): Promise<CoverComponentSettings | null> {
  try {
    const settings = await figma.clientStorage.getAsync('craneCoverComponent');
    return settings || null;
  } catch (e) {
    console.error('Failed to load cover component settings:', e);
    return null;
  }
}

async function previewCoverComponent(componentKey: string): Promise<{ success: boolean; name?: string; error?: string }> {
  try {
    const component = await figma.importComponentByKeyAsync(componentKey);
    return {
      success: true,
      name: component.name
    };
  } catch (error) {
    return {
      success: false,
      error: 'Could not find component. Make sure the URL is from a published library.'
    };
  }
}

async function insertCoverComponent(coverPage: PageNode): Promise<boolean> {
  const settings = await loadCoverComponentSettings();
  if (!settings || !settings.enabled || !settings.componentKey) {
    return false;
  }

  try {
    const component = await figma.importComponentByKeyAsync(settings.componentKey);

    // Switch to Cover page before creating instance
    figma.currentPage = coverPage;

    const instance = component.createInstance();

    // Position instance at origin of the cover page
    instance.x = 0;
    instance.y = 0;

    console.log('Cover component inserted successfully');
    figma.notify('Cover component added!');
    return true;
  } catch (error) {
    console.error('Failed to insert cover component:', error);
    figma.notify('Failed to insert cover component. Check that the component key is valid.', { error: true });
    return false;
  }
}

figma.ui.onmessage = async (event) => {
  switch (event.type) {
    case 'createPages':
      const layoutToCreate = event.layoutData || defaultLayout;
      await createPagesFromLayout(layoutToCreate);
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

    case 'saveCoverComponentSettings':
      if (event.settings) {
        await saveCoverComponentSettings(event.settings);
        figma.notify('Cover component settings saved!');
      }
      break;

    case 'loadCoverComponentSettings':
      const coverSettings = await loadCoverComponentSettings();
      figma.ui.postMessage({
        type: 'coverComponentSettingsLoaded',
        settings: coverSettings
      });
      break;

    case 'previewCoverComponent':
      if (event.componentKey) {
        const result = await previewCoverComponent(event.componentKey);
        figma.ui.postMessage({
          type: 'coverComponentPreviewResult',
          result: result
        });
      }
      break;

    case 'getSelectedComponentKey':
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.ui.postMessage({
          type: 'selectedComponentKey',
          success: false,
          error: 'No element selected. Please select a component.'
        });
      } else if (selection.length > 1) {
        figma.ui.postMessage({
          type: 'selectedComponentKey',
          success: false,
          error: 'Multiple elements selected. Please select only one component.'
        });
      } else {
        const node = selection[0];
        if (node.type === 'COMPONENT') {
          figma.ui.postMessage({
            type: 'selectedComponentKey',
            success: true,
            componentKey: node.key,
            componentName: node.name
          });
        } else if (node.type === 'INSTANCE') {
          // If it's an instance, get the main component's key
          const mainComponent = node.mainComponent;
          if (mainComponent) {
            figma.ui.postMessage({
              type: 'selectedComponentKey',
              success: true,
              componentKey: mainComponent.key,
              componentName: mainComponent.name
            });
          } else {
            figma.ui.postMessage({
              type: 'selectedComponentKey',
              success: false,
              error: 'Could not find main component for this instance.'
            });
          }
        } else {
          figma.ui.postMessage({
            type: 'selectedComponentKey',
            success: false,
            error: `Selected element is a ${node.type}, not a component. Please select a component.`
          });
        }
      }
      break;

    default:
      console.log('Unknown message type:', event.type);
  }
}