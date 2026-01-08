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
figma.showUI(__html__, { width: 320, height: 500 });
function updateExistingPages() {
    const existingPages = figma.root.children;
    console.log('Checking existing pages...');
    return existingPages.map(page => page.name);
}
function createPagesFromLayout(layoutData) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting Crane scaffold...');
        const existingPageNames = updateExistingPages();
        let coverPage = null;
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
                console.log(`Created: ${pageName}`);
                // Track the Cover page if this is it
                if (layoutItem.label === 'Cover') {
                    coverPage = page;
                }
            }
            else {
                console.log(`Skipped existing: ${pageName}`);
                // Also check existing pages for Cover
                if (layoutItem.label === 'Cover') {
                    coverPage = figma.root.children.find(p => p.name === pageName) || null;
                }
            }
        }
        // Auto-insert cover component if enabled
        // If Cover page wasn't in the layout, look for it in existing pages
        if (!coverPage) {
            coverPage = figma.root.children.find(p => p.name === '📄 - Cover' || p.name.includes('Cover')) || null;
        }
        if (coverPage) {
            yield insertCoverComponent(coverPage);
        }
        console.log('Scaffold complete!');
    });
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
// Cover component settings functions - using clientStorage for global persistence
function saveCoverComponentSettings(settings) {
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.clientStorage.setAsync('craneCoverComponent', settings);
        console.log('Cover component settings saved globally');
    });
}
function loadCoverComponentSettings() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const settings = yield figma.clientStorage.getAsync('craneCoverComponent');
            return settings || null;
        }
        catch (e) {
            console.error('Failed to load cover component settings:', e);
            return null;
        }
    });
}
function previewCoverComponent(componentKey) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const component = yield figma.importComponentByKeyAsync(componentKey);
            return {
                success: true,
                name: component.name
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Could not find component. Make sure the URL is from a published library.'
            };
        }
    });
}
function insertCoverComponent(coverPage) {
    return __awaiter(this, void 0, void 0, function* () {
        const settings = yield loadCoverComponentSettings();
        if (!settings || !settings.enabled || !settings.componentKey) {
            return false;
        }
        try {
            const component = yield figma.importComponentByKeyAsync(settings.componentKey);
            const instance = component.createInstance();
            // Position instance at origin of the cover page
            instance.x = 0;
            instance.y = 0;
            // Explicitly add instance to the cover page
            coverPage.appendChild(instance);
            console.log('Cover component inserted successfully');
            figma.notify('Cover component added!');
            return true;
        }
        catch (error) {
            console.error('Failed to insert cover component:', error);
            figma.notify('Failed to insert cover component. Check that the component key is valid.', { error: true });
            return false;
        }
    });
}
figma.ui.onmessage = (event) => __awaiter(void 0, void 0, void 0, function* () {
    switch (event.type) {
        case 'createPages':
            const layoutToCreate = event.layoutData || defaultLayout;
            yield createPagesFromLayout(layoutToCreate);
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
                yield saveCoverComponentSettings(event.settings);
                figma.notify('Cover component settings saved!');
            }
            break;
        case 'loadCoverComponentSettings':
            const coverSettings = yield loadCoverComponentSettings();
            figma.ui.postMessage({
                type: 'coverComponentSettingsLoaded',
                settings: coverSettings
            });
            break;
        case 'previewCoverComponent':
            if (event.componentKey) {
                const result = yield previewCoverComponent(event.componentKey);
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
            }
            else if (selection.length > 1) {
                figma.ui.postMessage({
                    type: 'selectedComponentKey',
                    success: false,
                    error: 'Multiple elements selected. Please select only one component.'
                });
            }
            else {
                const node = selection[0];
                if (node.type === 'COMPONENT') {
                    figma.ui.postMessage({
                        type: 'selectedComponentKey',
                        success: true,
                        componentKey: node.key,
                        componentName: node.name
                    });
                }
                else if (node.type === 'INSTANCE') {
                    // If it's an instance, get the main component's key
                    const mainComponent = node.mainComponent;
                    if (mainComponent) {
                        figma.ui.postMessage({
                            type: 'selectedComponentKey',
                            success: true,
                            componentKey: mainComponent.key,
                            componentName: mainComponent.name
                        });
                    }
                    else {
                        figma.ui.postMessage({
                            type: 'selectedComponentKey',
                            success: false,
                            error: 'Could not find main component for this instance.'
                        });
                    }
                }
                else {
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
});
