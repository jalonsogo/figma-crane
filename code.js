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
// Default layout data
let defaultLayout = [
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
figma.showUI(__html__, { width: 400, height: 500 });
function updateExistingPages() {
    const existingPages = figma.root.children;
    console.log('Checking existing pages...');
    return existingPages.map(page => page.name);
}
function createPagesFromLayout(layoutData) {
    console.log('🏗 Starting Crane scaffold...');
    const existingPageNames = updateExistingPages();
    for (const layoutItem of layoutData) {
        let pageName;
        if (layoutItem.type === 'separator') {
            pageName = '---';
        }
        else {
            pageName = layoutItem.emoji + ' - ' + layoutItem.label;
        }
        if (existingPageNames.indexOf(pageName) < 0) {
            const page = figma.createPage();
            page.name = pageName;
            console.log(`✅ Created: ${pageName}`);
        }
        else {
            console.log(`⏭ Skipped existing: ${pageName}`);
        }
    }
    console.log('🎉 Scaffold complete!');
}
function saveLayoutData(layoutData) {
    // Save to plugin data for persistence
    figma.root.setPluginData('craneLayout', JSON.stringify(layoutData));
    console.log('💾 Layout saved to plugin data');
    // Show success message
    figma.notify('Layout saved successfully!');
}
function loadLayoutData() {
    const savedData = figma.root.getPluginData('craneLayout');
    if (savedData) {
        try {
            return JSON.parse(savedData);
        }
        catch (e) {
            console.error('Failed to parse saved layout data:', e);
        }
    }
    return defaultLayout;
}
function scanForTeamLibraryComponents() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const foundComponents = new Map();
            // More efficient: single traversal for all relevant nodes
            const nodes = figma.root.findAll(node => node.type === 'INSTANCE' || (node.type === 'COMPONENT' && 'remote' in node && node.remote));
            for (const node of nodes) {
                if (node.type === 'INSTANCE') {
                    const instance = node;
                    const mainComponent = instance.mainComponent;
                    if ((mainComponent === null || mainComponent === void 0 ? void 0 : mainComponent.key) && mainComponent.remote && !foundComponents.has(mainComponent.key)) {
                        foundComponents.set(mainComponent.key, {
                            key: mainComponent.key,
                            name: mainComponent.name,
                            libraryName: ((_a = mainComponent.parent) === null || _a === void 0 ? void 0 : _a.name) || 'Library'
                        });
                    }
                }
                else if (node.type === 'COMPONENT') {
                    const component = node;
                    if (component.key && !foundComponents.has(component.key)) {
                        foundComponents.set(component.key, {
                            key: component.key,
                            name: component.name,
                            libraryName: 'Library'
                        });
                    }
                }
            }
            figma.ui.postMessage({
                type: 'teamLibraryScanComplete',
                components: Array.from(foundComponents.values())
            });
        }
        catch (error) {
            figma.ui.postMessage({
                type: 'teamLibraryScanComplete',
                components: [],
                error: 'Failed to scan'
            });
        }
    });
}
function addLibraryComponentToCover(componentKey, componentName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Import component
            const component = yield figma.importComponentByKeyAsync(componentKey);
            const instance = component.createInstance();
            instance.name = componentName || component.name;
            // Get or create Cover page
            let coverPage = figma.root.children.find(page => page.name.includes('Cover') || page.name.includes('📄'));
            if (!coverPage) {
                coverPage = figma.createPage();
                coverPage.name = '📄 - Cover';
            }
            // Add to page and position
            figma.currentPage = coverPage;
            const viewport = figma.viewport.center;
            instance.x = viewport.x - (instance.width / 2);
            instance.y = viewport.y - (instance.height / 2);
            coverPage.appendChild(instance);
            // Select and focus
            figma.currentPage.selection = [instance];
            figma.viewport.scrollAndZoomIntoView([instance]);
            // Notify success
            figma.ui.postMessage({
                type: 'componentAdded',
                componentKey,
                componentName,
                success: true
            });
            figma.notify(`Added "${instance.name}" to Cover page!`);
        }
        catch (error) {
            const errorMessage = error instanceof Error && error.message.includes('not found')
                ? 'Component not found or not published'
                : error instanceof Error && error.message.includes('access')
                    ? 'No access to this component'
                    : 'Failed to import component';
            figma.ui.postMessage({
                type: 'componentAdded',
                componentKey,
                componentName,
                success: false,
                error: errorMessage
            });
            figma.notify(errorMessage, { error: true });
        }
    });
}
figma.ui.onmessage = (event) => __awaiter(void 0, void 0, void 0, function* () {
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
        case 'addLibraryComponent':
            if (event.componentKey) {
                yield addLibraryComponentToCover(event.componentKey, event.componentName);
            }
            break;
        case 'scanTeamLibraries':
            yield scanForTeamLibraryComponents();
            break;
        default:
            console.log('Unknown message type:', event.type);
    }
});
