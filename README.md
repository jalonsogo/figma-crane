# Crane - Figma Page Scaffolding Plugin

**Version:** 1.0.0

Crane is a powerful Figma plugin designed to streamline your design workflow by automatically creating structured page layouts for your projects. Whether you're starting a new design project or organizing an existing one, Crane helps you maintain consistency and save time.

## 🚀 Features

### 📋 Scaffold Tab
- **Quick Page Creation**: Generate multiple pages with emoji icons and custom labels
- **Smart Detection**: Automatically detects existing pages to prevent duplicates
- **Selective Creation**: Choose which pages to create with individual checkboxes
- **Visual Preview**: See exactly what pages will be created before scaffolding

### ⚙️ Settings Tab
- **Custom Layout Editor**: Fully customizable page structure with drag-and-drop reordering
- **Emoji Picker**: Modern emoji selector with search and category filtering
- **Page Management**: Add, duplicate, delete, and modify pages and separators
- **Live Preview**: Changes reflect immediately in the scaffold tab
- **Auto-Insert Cover Component**: Automatically add a component to the Cover page when scaffolding

### 📤 Import/Export Tab
- **URL Import**: Import layouts from remote JSON files
- **File Import**: Import layouts from local JSON files
- **JSON Export**: View and copy layout configurations
- **Download Export**: Save layouts as JSON files for sharing or backup

### 🧩 Components Tab
- **Library Component Integration**: Add components from external Figma libraries directly to your Cover page
- **Component Key Import**: Import components using their unique component keys
- **Recent Components**: Quick access to recently added components
- **Smart Placement**: Components are automatically positioned and selected on the Cover page

## 🎯 Default Layout Structure

Crane comes with a thoughtfully designed default layout perfect for design projects:

- 🚧 **Task or feature name** - Project overview page
- 🧩 **Components** - Design system components
- 📐 **Specs** - Technical specifications
- 🧠 **Moodboard** - Visual inspiration
- 💡 **Ideas** - Brainstorming and concepts
- ☣️ **Discarded** - Archived ideas
- 📄 **Cover** - Project presentation

## 🛠️ How to Use

1. **Open the Plugin**: Go to Plugins → Crane in your Figma file
2. **Choose Pages**: In the Scaffold tab, select which pages you want to create
3. **Create**: Click the "Create" button to generate your page structure
4. **Add Components**: Use the Components tab to add library components to your Cover page
5. **Customize**: Use the Settings tab to modify the layout for future projects
6. **Share**: Export your custom layouts to share with your team

## 📊 Advanced Features

### Auto-Insert Cover Component
Configure Crane to automatically insert a component onto the Cover page when scaffolding:
1. Open the Settings tab and enable "Auto-insert cover component"
2. Select a component in your Figma file and click "Use Current Selection" to capture its key
3. Optionally use the "Verify" button to validate the component key before saving
4. When scaffolding, the component will be automatically inserted on the Cover page

This feature uses `clientStorage` for global persistence, so your component key is saved across all Figma files.

### Drag & Drop Reordering
Easily reorganize your page structure by dragging items in the Settings tab.

### Context Menu
Right-click any item in the Settings tab to:
- Duplicate items
- Delete unwanted pages

### Emoji Categories
The emoji picker includes organized categories:
- 😀 Faces & People
- 🐶 Animals & Nature
- 🍏 Food & Drink
- ⚽ Activities & Sports
- 🚗 Travel & Places
- ⌚ Objects & Symbols

### Import/Export Formats
Layouts are saved in a simple JSON format:
```json
[
  {
    "emoji": "🚧",
    "label": "Task or feature name",
    "type": "page"
  },
  {
    "emoji": "─",
    "label": "─────────────",
    "type": "separator"
  }
]
```

### Library Component Integration
Add components from your team libraries directly to the Cover page using two methods:

#### Method 1: Import Component Data (Recommended)
This method works with any Figma library file:

1. **Export Components**: Copy and run this code in your library file's console:
   ```javascript
   const components = figma.root.findAllWithCriteria({ types: ['COMPONENT'] });
   const componentData = components.map(comp => ({
     key: comp.key,
     name: comp.name,
     description: comp.description || '',
     libraryName: figma.root.name
   }));
   console.log(JSON.stringify(componentData, null, 2));
   ```

2. **Import to Crane**: 
   - Go to the Components tab
   - Paste the JSON output in the Component Data field
   - Click "Import Components"
   - Components appear as visual cards

3. **Add to Cover**: Click any component card to instantly add it to your Cover page

#### Method 2: Scan Team Libraries
For components already in use in your file:

1. **Enable Libraries**: Make sure your team libraries are enabled in the current file (Assets panel)
2. **Scan**: Click "Scan for Available Components" in the Components tab
3. **Select**: Click any found component to add it to the Cover page

#### Visual Component Selection
- Components are displayed as cards with:
  - 🧩 Icon placeholder
  - Component name
  - Library name
- Click any card to add that component to the Cover page
- Components are automatically positioned at the center of the viewport

#### Requirements
- Components must be **published** in their source library
- You need **access** to the team/organization that owns the library
- For Method 2, libraries must be **enabled** in your current file

## 🎨 Benefits

- **Consistency**: Maintain uniform project structure across teams
- **Efficiency**: Save time setting up new projects
- **Organization**: Keep your Figma files well-structured
- **Flexibility**: Customize layouts for different project types
- **Collaboration**: Share standardized layouts with your team

## 🔧 Technical Details

- **API Version**: Figma Plugin API 1.0.0
- **UI Framework**: HTML/CSS/JavaScript
- **Storage**: Plugin data persistence for custom layouts
- **Compatibility**: Works with all Figma plans

## 📝 License

This plugin is provided as-is for design workflow enhancement.
