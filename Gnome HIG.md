# GNOME Human Interface Guidelines

> Compiled from https://developer.gnome.org/hig/ (index page + all navbar subpages), for use as a design reference/skill when building GNOME Shell extensions and GTK/Libadwaita apps in this repo.

## Table of Contents

- [Index](#index)
- Design Principles
- Tools & Resources
- Guidelines
  - App Naming
  - App Icons
  - Pointer & Touch
  - Keyboard
  - UI Icons
  - UI Styling
  - Writing Style
  - Typography
  - Navigation
  - Scaling & Adaptiveness
  - Accessibility
- Patterns
  - Containers
    - Windows
    - Header Bars
    - Popovers
    - Utility Panes
    - Boxed Lists
    - Grid Views
    - List & Column Views
    - Selection & Edit Modes
  - Navigation
    - Browsing
    - View Switchers
    - Tabs
    - Sidebars
    - Search
  - Controls
    - Buttons
    - Menus
    - Switches
    - Text Fields
    - Checkboxes
    - Radio Buttons
    - Drop-Down Lists
    - Sliders
    - Spin Buttons
    - Overlaid Controls
  - Feedback
    - Notifications
    - Toasts
    - Banners
    - Progress Bars
    - Spinners
    - Dialogs
    - Placeholder Pages
    - Tooltips
- Reference
  - Standard Keyboard Shortcuts
  - Palette
  - Backgrounds

---

## Index

The GNOME HIG is the primary source of design documentation for those creating software with the GNOME development platform, targeting app designers and developers. It is compatible with GTK 4 and Libadwaita, and organizes content into five major sections: foundational principles, available resources, established conventions, reusable UI components, and technical reference materials. The community can report issues and propose enhancements via GNOME's GitLab repository.

Source: https://developer.gnome.org/hig/index.html

---

## Design Principles

Source: https://developer.gnome.org/hig/principles.html

The HIG and the GNOME platform reflect the GNOME design tradition and philosophy, informed by over 20 years of collective experience creating user-facing software.

Designers and developers building for the GNOME platform are encouraged to familiarize themselves with the design philosophy, as this enhances their ability to produce beautiful, effective, attractive, and easy-to-use applications.

### Design for People

"People are at the heart of GNOME design. Wherever possible, we seek to be as inclusive as possible." This means accommodating different physical abilities, cultures, and device form factors. The software requires minimal specialist knowledge and technical ability.

The commitment to creating accommodating software is integrated throughout all guiding principles.

### Make it Simple

The best applications accomplish one task and execute it well. This often requires understanding your app's goals—not just functionally, but also how people will use it and integrate it into their lives. Simplicity applies to individual views and elements as well as the application overall.

Key considerations include:

- Resist creating an app for all people in all situations; instead focus on one scenario or experience type
- Avoid overwhelming users with excessive elements simultaneously; employ progressive disclosure and navigation structures for guidance
- Position frequently used actions conveniently, placing less important actions further away

### Reduce User Effort

Software creators should minimize the work and effort required from users. This typically involves anticipating user needs and understanding the situations and audiences your application serves.

Recommended approaches include:

- Automate tasks when possible
- Minimize steps needed to complete tasks
- Reduce information users must remember (tabs, recently used lists, and automatic suggestions are effective techniques)
- Keep text concise and focused

### Be Considerate

Anticipating user needs extends beyond providing useful functionality—it requires considering what users don't want from your application.

Best practices include:

- Anticipate and prevent mistakes
- Allow destructive actions to be reversed instead of requiring confirmations
- Respect people's time and attention by avoiding unnecessary interruptions or distractions

---

## Tools & Resources

Source: https://developer.gnome.org/hig/resources.html

A collection of tools and resources are available for those designing for the GNOME platform.

### General Resources

- Color palette: [Inkscape/GIMP format](https://gitlab.gnome.org/Teams/Design/HIG-app-icons/raw/master/GNOME%20HIG.gpl?inline=false), [reference table](reference/palette.html)

### Apps

The following apps are all available to install:

- [Icon Library](https://flathub.org/apps/details/org.gnome.design.IconLibrary): for finding icons to use in GNOME UI
- [Typography](https://flathub.org/apps/details/org.gnome.design.Typography): for selecting text styles and commonly used characters
- [App Icon Preview](https://flathub.org/apps/details/org.gnome.design.AppIconPreview): app icon creation assistant
- [Symbolic Preview](https://flathub.org/apps/details/org.gnome.design.SymbolicPreview): symbolic icon creation assistant
- [Color Palette](https://flathub.org/apps/details/org.gnome.design.Palette): reference for the GNOME color palette

### Toolkit

The following tools are useful for seeing how the different patterns and design elements work in practice:

- Adwaita Demo: a demo app for libadwaita. This can be installed from the [gnome-nightly flatpak repository](https://nightly.gnome.org/repo/appstream/org.gnome.Adwaita1.Demo.flatpakref) and is sometimes packaged by distributions as `adwaita-1-demo`.
- [GTK inspector](https://docs.gtk.org/gtk4/running.html#interactive-debugging): can be used to inspect any GTK app

### SVG Templates & Examples

The following templates can be used as a starting point for mockups and icons.

- [App mockup template (SVG)](https://gitlab.gnome.org/Teams/Design/mockup-resources)
- [App icon template (SVG)](https://gitlab.gnome.org/Teams/Design/HIG-app-icons/-/blob/master/template.svg)

Additionally, all this work is publicly available and can be freely reused, though not all materials may reflect current recommendations.

---

## Guidelines

Source: https://developer.gnome.org/hig/guidelines.html

The guidelines section covers the standard conventions used in GNOME UX design. These are all generally applicable, and are relevant to all apps and design patterns.

### App Naming

Source: https://developer.gnome.org/hig/guidelines/app-naming.html

App names are vital to user experience. They communicate functionality while establishing identity and character. The visual presentation—size and shape—also carries practical and aesthetic importance.

**What to Aim For**

A strong app name should:

- Comprise one or two straightforward nouns
- Connect to the application's purpose (example: Celluloid for video playback)
- Stay concise (under 15 characters)
- Be pronounceable
- Work well with an icon through visual association
- Follow header capitalization standards

Names to avoid:

- Existing trademarks or project names
- "G" prefixes
- Overly complex terminology and acronyms
- Humorous references or inside jokes
- Irregular punctuation or spacing
- Invented terminology

**Choosing a Name**

1. *Brainstorm* — Generate initial ideas by listing domain-related vocabulary. For a video player, this might include cinema, television, and playback terminology. Expand options using thesaurus resources.
2. *Create a Shortlist* — From an extensive list (approximately 20 names), narrow down to the strongest five candidates.
3. *Verify Availability* — Search across web platforms, app stores, and hosting services to confirm no existing uses. Eliminate any duplicates.
4. *Select Your Name* — From remaining viable options, choose based on: distinctiveness against competing applications, acoustic pleasantness when spoken, and alignment with overall app personality.

### App Icons

Source: https://developer.gnome.org/hig/guidelines/app-icons.html

In addition to having a great name, every app needs a great icon. GNOME app icons are deliberately simple in style to make icon creation as accessible as possible.

The [App Icon Preview](https://flathub.org/apps/details/org.gnome.design.AppIconPreview) tool is recommended for app icon creation, supporting template generation, icon previewing, and asset export.

**App icons should be unique to each app. Reusing existing icons for app identities is strongly discouraged.**

**Metaphor**

Each app icon should have a simple, recognizable metaphor with a clear relationship to the app name. Common metaphor types include:

- Physical objects directly related to the app's function (e.g., speaker for music app)
- Physical objects somewhat related to the app's domain or older analog versions (e.g., cassette tape for podcast app)
- Symbols related to the domain (e.g., play triangle for video player)
- Simplified, stylized versions of the app's distinctive UI

Avoid metaphors unrelated to the app name or function, such as characters, mascots, or logos relying on specific visual styles.

**GNOME App Icon Style**

The GNOME app icon style is simple and geometric, using primarily basic shapes.

*Size & Shape* — App icons are drawn within a 128×128px area but shouldn't fill this space. Follow the app icon template guides and maintain visual weight similar to other app icons. Avoid extreme aspect ratios (very narrow or wide shapes). Align the icon bottom against the standard baseline indicated in the template.

*Perspective* — Depth is created by combining the "top" and "front" of objects, with each icon having an additional profile at the bottom. The "front" profile is shaded darker than the top surface. The profile is typically subtle, no taller than 2 detail units (4 nominal pixels), though exceptions exist.

*Material & Lighting* — Icons may use skeuomorphic materials (wood, metal, glass) if needed; otherwise, simple colors and textures are recommended. Use the standard color palette as a base. Straight surfaces should have flat colors; gradients are reserved for curved surfaces. Shadows should be avoided if possible but can provide contrast between elements. Light sources should point straight down from above. Don't draw shadows outside the main icon silhouette, as these are generated programmatically.

*Detail* — Icons are defined at 128×128px but typically viewed at 64×64px and can scale down to 32×32px. Avoid excessive detail that will be lost at small sizes. The template includes a 2px grid to follow, helping prevent excess detail.

**Symbolic App Icons**

Each app should have an additional symbolic version for smaller sizes and special contexts. The symbolic icon style follows the UI icons guidelines. App symbols can be drawn in the same SVG as the full-size icon, as indicated in the template. The same metaphor as the full-size icon should be used where possible.

**Nightly Variant**

For nightly or beta builds, create a specific icon version to distinguish them from stable releases. App Icon Preview can automatically generate a nightly variant, though manual adjustments may be desirable in some cases.

### Pointer & Touch

Source: https://developer.gnome.org/hig/guidelines/pointer-touch.html

A pointing device enables on-screen pointer manipulation, typically shown as an arrow cursor. While mice and touchpads are common, graphics tablets, track balls, track points, and joysticks also qualify. Touchscreens function similarly despite lacking a visible pointer.

**General Guidelines**

User interface designs must accommodate a full spectrum of pointing devices, except for specialist apps (games with controller features, graphics applications requiring tablets). When specific devices are required, this should be communicated clearly.

Designs should accommodate varying physical abilities, recognizing that pointer precision differs among users and situations.

Key principles:

- Click targets should be large enough to be comfortably used with different pointing devices and physical abilities
- Controls exclusive to certain devices shouldn't be solely relied upon
- Avoid physically demanding actions like double-clicking or simultaneous button pressing
- Designs should remain input device agnostic; avoid UI text referencing "moving the mouse"
- Pointer hover should not be relied upon for revealing actions or essential information
- All pointing device actions must also function via keyboard

**Primary & Secondary Actions**

The primary action activates, opens, or selects. Secondary action displays additional options through context menus. Secondary actions should avoid serving as alternative deletion/removal options, only appear when relevant menu items exist, and remain keyboard accessible. Middle mouse buttons aren't recommended for app designs.

**Scrolling, Panning & Zooming**

Scroll-only views use:
- Mouse: scroll wheel
- Touchpad: two-finger drag
- Touchscreen: single-finger drag
- Zoom: Ctrl+scroll (mouse), pinch (touchpad/touchscreen)

Pan-capable views use:
- Mouse: click+drag for panning; scroll wheel for zoom
- Touchpad: click+drag or tap-then-drag for panning; two-finger drag/pinch for zoom
- Touchscreen: single-finger drag for panning; pinch for zoom

**Additional Guidelines**

- Pressing Esc while a pointer operation is in progress should cancel it
- System reserves three and four-finger gestures; apps should avoid these
- Top and bottom screen edge drags are system-reserved
- Apps may use two-finger gestures and left/right edge drags

### Keyboard

Source: https://developer.gnome.org/hig/guidelines/keyboard.html

Keyboard interaction encompasses text entry, shortcuts, and keyboard-as-sole-input scenarios. This is particularly vital for users with visual or mobility impairments.

**Core Principle**

Every action performable with a pointing device should also be possible via keyboard. The guideline recommends testing your app using only keyboard input to verify accessibility.

**Shortcut Keys**

Adhere to standard GNOME shortcuts for consistency across apps. Assign shortcuts to frequently-used actions, but avoid overuse.

Guidelines for non-standard shortcuts:
- Favor `Ctrl` + letter combinations
- Use `Shift+Ctrl` + letter for reversals or extensions (undo/redo pattern)
- Make mnemonics intuitive (e.g., `Ctrl+E` for edit)
- Avoid `Alt` to prevent access key conflicts
- Reserve `Super` key for system shortcuts
- Prioritize one-handed accessibility for common operations

**Access Keys**

Access keys enable control operation via `Alt` + key combinations, displayed as underlined letters when `Alt` is pressed.

Selection guidelines:
- Prefer first letters; use secondary word letters if needed
- Avoid thin letters (i, l) or those with descenders (g, y)
- Prioritize frequently-used controls if covering all is difficult
- Account for translation conflicts when assigning keys

**Keyboard Navigation**

All UI elements must be navigable and interactive via keyboard, primarily using `Tab`. Focus sequences follow the widget tree structure. Arrow keys should enable directional navigation where possible.

Standard navigation keys:

| Keys | Function |
|------|----------|
| Tab | Next control |
| Shift+Tab | Previous control |
| Ctrl+Tab | Next (when Tab has alternate function) |
| Shift+Ctrl+Tab | Previous (when Tab has alternate function) |
| Return | Activate focused control |
| Space | Toggle control state |
| F10 | Open primary/secondary menu |
| Menu/Shift+F10 | Open context menu |
| Esc | Close transient container |

### UI Icons

Source: https://developer.gnome.org/hig/guidelines/ui-icons.html

**UI Icon Style**

GNOME employs the "symbolic" style for UI icons—a simple, monochrome approach designed for smaller sizes. These icons are drawn as 16×16px SVGs and work well at 32×32px, 64×64px, and 128×128px sizes. Avoid other dimensions to prevent distorted rendering.

The design supports programmatic recoloring of icons, either entirely or partially. GNOME also includes full-color icon styling, primarily for app icons, though these can serve UI functions at larger scales where they become focal points—such as file and folder icons in file managers.

**Finding UI Icons**

GTK provides a built-in collection of symbolic icons accessible to applications. The Icon Dev Kit offers additional icons available for copy/pasting. Both resources are browsable through the Icon Library app on Flathub, which enables searching and provides implementation guidance. Reuse existing icons rather than creating originals when possible.

**When to Use UI Icons**

Controls should typically use either labels or icons, not both, to reduce visual clutter when space is limited. However, sidebars and view switchers represent exceptions where combining both is appropriate.

Icons most frequently identify buttons, and when users will recognize them, icons are preferable to labels. Common, convention-based icons include search, menu, forward, back, and share. Domain-specific symbols work for specialist tool users. Some icons require context—for instance, a stop button (square shape) or remove icon (horizontal line) only register as intended when paired with related symbols. Using text labels remains advisable when icon recognition is uncertain.

**Symbolic Icon Creation**

The Symbolic Preview app assists in creating new icons by generating SVG templates and previewing results across different contexts.

Characteristics for symbolic icon creation include:
- 16×16px nominal dimensions with margins for shape uniqueness and visual consistency
- Orthogonal views without perspective
- 2px strokes for primary features; 1px strokes should be avoided
- Monochrome definition with programmatic recoloring

Additional creation guidance emphasizes identifying single distinguishing properties rather than repeating visual concepts across related icons, aligning shapes to pixel grids for sharp rendering, and ensuring negative space works when colors invert.

### UI Styling

Source: https://developer.gnome.org/hig/guidelines/ui-styling.html

**Overview**

The visual design framework for GNOME applications is called Adwaita. This system encompasses both light and dark styling variants that apply universally across UI components, plus additional customization options for individual widgets.

**Light and Dark UI Styles**

- Most apps should use the standard light UI style by default, though dark styling suits applications displaying rich visual media
- Applications defaulting to light should ideally respect the system-wide style preference, enabling users to switch to dark mode
- Per-app style toggles work best for text editors and intensive-use applications where contrast control matters
- When offering style preferences, three options should typically be included: light, dark, and follow system preference

Developers should reference [AdwStyleManager](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1-latest/class.StyleManager.html) for relevant APIs.

**High Contrast Mode**

This accessibility feature dramatically increases visual contrast. Applications require testing with high contrast enabled to verify proper rendering, using either system settings or [GTK Inspector](https://docs.gtk.org/gtk4/running.html#interactive-debugging).

**Built-In Style Options**

Libadwaita provides visual styling choices for individual elements—such as suggested and destructive button styles indicating function. The [Libadwaita style class documentation](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1-latest/style-classes.html) catalogs available style classes.

**Custom Styling**

Minimizing custom styling reduces maintenance burden, decreases bugs, and preserves accessibility and internationalization compatibility. Leverage existing style classes and color variables, which automatically adjust across light, dark, and high-contrast modes.

Avoid:
- Using color exclusively to distinguish information; employ alternative methods like shape, position, or text
- Flashing or blinking elements that could trigger seizures

Comprehensive testing across accessibility tests is essential for custom UI elements.

### Writing Style

Source: https://developer.gnome.org/hig/guidelines/writing-style.html

Text plays an important role in user interfaces. Above all, user interface text should be easy to understand and quick to read.

**General Style**

User interface text should be short and to the point. This improves speed of comprehension for the user. It also reduces the expansion of text when translated.

Try to find the fewest possible words to satisfactorily convey the necessary meaning. However, do not shorten text to the point of losing meaning. A three-word label that provides clear information is better than a one-word label that is ambiguous or vague.

Text should typically have a neutral perspective and tone. Pronouns like "you" or "my" should generally be avoided. However, if it is necessary to refer to something as belonging to the user, "your" is preferable to "my". For example: "Your Records".

**Terminology**

Use words, phrases, and concepts that are familiar to the people who will be using your app, rather than terms from the underlying system. This may mean using terms that are associated with the tasks your app supports. For example, in medicine, the paper folder that contains patient information is called a "chart". Hence, a medical app might refer to a patient record as a "chart" rather than as a "patient record".

When referring to parts of the user interface, use the standard GNOME terms, such as "pointer" and "window". The HIG can be used as a reference in this regard.

**Translations**

User interface text is typically written in US English and then translated into other languages. It is important that the original English text can be easily translated, and will be easy to understand in other languages and cultures.

- Avoid constructing sentences from text in several controls: sentences that run from one control to another will often not make sense when translated into different languages.
- Latin abbreviations such as "i.e." or "e.g." should be avoided, since they can't always be easily translated and can be unintelligible when read by screen readers. Instead, use full words like "for example".

**Capitalization**

Two styles of capitalization are used in GNOME user interfaces: header capitalization and sentence capitalization.

*Header Capitalization* — should be used for any headings, including headings in header bars, tab titles, and view titles. It should also be used for short control labels that do not normally form proper sentences, such as button labels, switch labels, menu items and tooltips.

Header capitalization should capitalize the first letter of:
- All words with four or more letters
- Verbs of any length, such as "Be", "Are", "Is", "See" and "Add"
- Nouns of any length
- The first and last word
- Hyphenated words; for example: "Self-Test" or "Post-Install"

Examples: "Create a Document", "Find and Replace", "Document Cannot Be Found"

*Sentence Capitalization* — should be used for labels that form sentences or that run on to other text, including labels for check boxes, radio buttons, sliders, text entry boxes, field labels and combobox labels. It should also be used for explanatory or body text, such as in dialogs or notifications.

Capitalize the first letter of the first word and any words that are normally capitalized in sentences, such as proper nouns.

Examples: "The document cannot be found in this location", "Finding results for London"

**Heading Style**

Headings follow a standard form and do not form complete sentences. In this form, auxiliary verbs (such as "have" and "is") and articles (like "a", "an", and "the") are omitted. For example, a heading would typically be written as "Three Documents Updated", as opposed to "Three Documents Have Been Updated".

Headings typically use header capitalization.

In some cases, a heading can be given a more informal style by expressing it as a regular sentence. In this case:
- Write the heading as a sentence, including auxiliary verbs and articles
- Use sentence capitalization
- Continue to use a bold font style

Examples: "File has changed on disk", "App is potentially unsafe"

**Ellipses (…)**

Use an ellipsis (…) at the end of a label if further input or confirmation is required from the user before the action can be carried out. Examples: *Save As…*, *Find…*, *Delete…*

Do not add an ellipsis to labels such as *Properties* or *Preferences*. While these commands open windows that can incorporate further functionality, the label does not specify an action, and therefore does not need to communicate that further input or confirmation is required.

**Periods (.)**

Text generally shouldn't end with a period. This applies to headings, descriptions, and includes text that is written as a complete sentence.

Only use periods when it is necessary to break up a paragraph into multiple sentences, or when text is part of a longer multi-paragraph piece of text.

### Typography

Source: https://developer.gnome.org/hig/guidelines/typography.html

**General Guidelines**

Prioritize using default system fonts provided by your distribution or operating system. In GNOME, the default is Adwaita Sans, a custom variant of Inter typeface designed by Rasmus Andersson.

Avoid placing text over graphical backgrounds or textures, as this diminishes contrast and readability—particularly problematic for users with visual impairments.

**Variants, Sizes & Weights**

Different text weights and colors help distinguish information types. However, excessive variants, sizes, and weights complicate readability. Minimize the number of font sizes and weights used.

- Apply lighter/smaller text for less important information
- Use heavier/darker text to emphasize important content
- Avoid italic or oblique typefaces; they're visually complex and distracting
- Don't use all-caps text
- Never hard-code font styles or sizes; use standard styles or express sizes as relative values to preserve accessibility

**Standard Font Styles** (GTK 4 only)

| Style | CSS Class | Purpose |
|-------|-----------|---------|
| Body | `body` | Default style for control labels and descriptive text |
| Heading | `heading` | UI headings like window titles and control groups |
| Caption & Caption Heading | `caption`, `caption-heading` | Small text accompanying regular body text |
| Title | `large-title` | Largest style for display headings in greeters/assistants |
| Title 1–4 | `title-1`–`title-4` | Heading range for display, placeholders, and welcome graphics |

**Take Advantage of Unicode**

| Usage | Incorrect | Correct | Unicode |
|-------|-----------|---------|---------|
| Quotation | "quote" | "quote" | U+201C, U+201D |
| Multiplication | 1024x768 | 1024×768 | U+00D7 |
| Ellipsis | Introducing... | Introducing… | U+2026 |
| Apostrophe | The user's preferences | The user's preferences | U+2019 |
| Bullet list | \* One | • One | U+2022 |
| Ranges | June-July 1967 | June–July 1967 | U+2013 |
| Units | 32GB | 32 GB | U+202F |

The Typography app provides convenient access to copy these recommended characters.

### Navigation (Guidelines)

Source: https://developer.gnome.org/hig/guidelines/navigation.html

While some apps only need a single view, most need to be broken down into a series of views or windows. The navigation and containers patterns cover common design options for accomplishing this.

**Window-Based Navigation**

Different views can be shown in a single window using design patterns that allow moving between views, or in secondary windows displayed above the main window. The decision depends on:
- Fitting content to appropriately sized containers
- Following general guidelines, such as avoiding stacked secondary windows
- Following conventions (preferences, about windows)

"Showing multiple views inside an existing window is generally preferable to showing new windows, since it results in a smoother experience."

**Simple Navigation**

*Flat Navigation* — The simplest pattern is the view switcher, allowing a small number of equivalent pages within a single window. This works well for apps displaying different information types or controls. View switchers have a flat structure where each page holds equal importance and can be accessed from any other. Sidebars offer another flat navigation option when too many pages exist for a view switcher.

*Hierarchical Navigation* — In hierarchical navigation, a parent view provides links to multiple sub-views. The parent might be a grid or list, with sub-views shown either in secondary windows or the same window. This structure works well "when it is desirable to provide an 'overview' which shows multiple items, such as a collection of photos, or a summary of app settings."

**Complex Navigation**

More elaborate arrangements combine flat top-level navigation with hierarchical navigation below, enabling browsing through content categories.

**Guidelines**

- Ensure each view contains digestible content levels
- Each view should have a clear focus or subject
- Avoid overcomplicated navigation combining multiple types non-standardly
- Prevent deeply nested hierarchies—generally limit to one level
- Support standard keyboard shortcuts for navigation

### Scaling & Adaptiveness

Source: https://developer.gnome.org/hig/guidelines/adaptive.html

**Overview**

GNOME supports diverse device types including desktops, laptops, convertibles, and phones. Windows can be used at various sizes and tiled alongside other applications. Applications must function well across a range of window dimensions.

**Adaptive Design**

The adaptive design approach enables applications to adjust to different screen sizes. Well-designed adaptive apps maintain consistent functionality across narrow phone-appropriate dimensions up to expansive desktop sizes.

*Design Approach*
- Follow GNOME design conventions for app structure to support multiple sizes
- Begin design from the most constrained environment and work toward less constrained ones
- Utilize established patterns and widgets designed with adaptiveness in mind

*Layout Considerations*
- Implement list patterns for content that scales well across narrow and wide view widths
- Ensure containers maintain appropriate proportions relative to window width without requiring manual resizing
- Use breakpoints to switch between different UI layouts based on available space
- Maintain smooth window resizing with no jumping or disappearing widgets
- Account for dynamic hardware capabilities that may vary from physical form factor expectations

**Small Size Handling**

The minimum recommended display size for GNOME on desktop is 1024×600px, which all applications should support. Phone form factor applications should scale down to 360×294px.

**Large Size Handling**

Large windows present challenges including:
- Physically distant related controls
- Uncomfortably long text lines
- Lost visual structure in grids

Place content within maximum-width containers—either visible containers like lists or invisible restraining frames—to address these issues.

**Technical Reference**

- Libadwaita: Adaptive Layouts documentation

### Accessibility

Source: https://developer.gnome.org/hig/guidelines/accessibility.html

Accessibility guidelines are integrated throughout the HIG, with pages on keyboard interaction, pointer interaction, and UI styling being particularly pertinent to this subject.

**General Guidelines**

"Good design and accessibility are mutually reinforcing" and following the principles of good design enhances accessibility. Careful consideration of design principles represents one of the most effective approaches to improving app accessibility.

**Accessible Names**

All interface elements require descriptive, accessible names that screen readers can vocalize. While GTK supplies default accessible descriptions for many UI components, additional names may sometimes be necessary. Developers should consider replacing defaults with more contextual or application-specific descriptions when beneficial. Accessible names should prioritize brevity and clarity.

**Testing for Accessibility**

Multiple straightforward methods exist for verifying app accessibility. Testing should confirm proper function with these accessibility features:

- **High-contrast mode**: Accessible via GTK Inspector or Accessibility settings. The UI must render correctly in high-contrast style.
- **Large text mode**: Enabled through Accessibility settings. Does the interface maintain proper appearance? Are all labels legible?
- **Keyboard navigation**: Operate the app using only keyboard controls. Can users navigate to and interact with all components? Does navigation follow the keyboard navigation guidelines?
- **Screen reader**: Activated in Accessibility settings. Does the system read all UI elements aloud? Are accessible names accurate? Can the app function with the display disabled?
- **On-screen keyboard**: Is the app usable with OSK-only text input? Can every text entry field be accessed successfully?

---

## Patterns

Source: https://developer.gnome.org/hig/patterns.html

"GNOME design patterns represent the elements from which an overall design can be constructed." Some patterns apply universally across applications, while others serve specialized purposes.

A pattern frequently corresponds to a single user interface widget or API, though patterns can also combine multiple widgets in specific configurations.

Four pattern categories: **Containers**, **Navigation**, **Controls**, **Feedback**.

### Containers

Source: https://developer.gnome.org/hig/patterns/containers.html

Containers are some of the main UI building blocks. They include the primary containers for other UI elements, like windows and header bars. They also include some of the main layout frameworks, in the shape of boxed lists, grid views and list views.

Container types: Windows, Headerbars, Popovers, Utility Panes, Boxed Lists, Grid Views, List & Column Views, Selection & Edit Modes.

#### Windows

Source: https://developer.gnome.org/hig/patterns/containers/windows.html

Windows are the main containers for app user interfaces.

**Primary Windows**

Primary windows host the main functionality of your app, and are what is displayed when your app is launched.

- Primary windows should always be independent — closing one primary window should not result in other primary windows being closed.
- Apps can be restricted to a single primary window, or can make it possible to have multiple primary windows open at the same time (the latter being common in viewer and editor apps).
- All primary windows should be resizable.
- The default size of primary windows should be appropriate to their content. Windows that display large content like documents or videos should be big enough to support viewing and editing without the need to increase the window size. On the other hand, windows with a limited amount of UI can and should default to a smaller size, in order to avoid large amounts of blank space.

**Secondary Windows**

Secondary windows are used to contain supplemental controls or information. About Windows and Preferences Windows are both types of secondary window.

- Secondary windows should always belong on a primary window, so that closing the primary also closes the secondary.
- Secondary windows can contain information and preferences that are relevant to the entire app, or they can contain information and options for a single content item, such as a document Properties Window.
- Typically, secondary windows are modal to their parent primary window. This ensures that windows are grouped together. However, in some unusual cases, secondary windows can be non-modal to their parent window. This is typically when they provide equivalent functionality to the primary window, such as an email app that allows individual emails to be popped out into their own windows.
- Avoid stacking secondary windows on top of one another.
- In general, secondary windows should not be bigger than their parent windows, and should have limited, simple content.

**General Guidelines**

- Windows should follow the standard Ctrl+W keyboard shortcut to close. Additionally, modal windows should close on Esc.
- Apps which restore a particular view or content item when they are restarted should also restore their previous window size.

Additional guidance on window sizing can be found in the scaling and adaptiveness guidelines.

API Reference: Libadwaita `AdwApplicationWindow`, `AdwAboutWindow`, `AdwPreferencesWindow`; GTK 4 `GtkApplicationWindow`

#### Header Bars

Source: https://developer.gnome.org/hig/patterns/containers/header-bars.html

**Overview**

Header bars are standard elements spanning window tops that enable window dragging, house window management features, and contain app controls.

**Common Header Bar Components**

- **Buttons** for primary actions (new, add, open, back) positioned at the start/left side
- **Window heading** centered (sometimes replaced with a view switcher)
- **Menus** typically placed at the end/right side

**Guidelines**

- Arrange controls using three alignment points: left, center, and right
- Keep the number of controls minimal to clarify primary functionality and support narrow window widths
- Update header bar content alongside view or mode changes to maintain contextual relevance
- Maintain blank space for window dragging capability
- Add tooltips to all primary window header bar controls

**Button Style**

Header bar buttons should appear without visible backgrounds or borders when possible. This styling automatically applies to icon-only buttons, icon and label combinations, and split buttons.

Avoid buttons with text labels only, suggested/destructive action styles, or linked styling in primary header bars, as these lack automatic appearance adjustment and create visual inconsistency.

*Button Grouping* — Buttons can be grouped to show functional relationships. Spacing—using separators with the spacer style class—is recommended over linked buttons. Split buttons also effectively group a button with a connected dropdown.

API Reference: Libadwaita `AdwHeaderBar`; GTK 4 `GtkHeaderBar`

#### Popovers

Source: https://developer.gnome.org/hig/patterns/containers/popovers.html

**Overview**

A popover functions as an overlay container that sits atop a window and can be toggled open or closed through an attached button. These containers accommodate various UI elements and serve multiple purposes, such as displaying content lists, view option controls, or tool palettes.

**Guidelines**

- Maintain consistency by avoiding mixed control types within a single popover; group similar controls together
- Include a heading when the popover's purpose requires clarification
- Close or Done buttons are typically unnecessary
- Keep popovers compact—they should ideally occupy no more than one-third of the parent window—with minimal complexity
- Enable the Esc key to dismiss an open popover

API Reference: [GtkPopover](https://docs.gtk.org/gtk4/class.Popover.html)

#### Utility Panes

Source: https://developer.gnome.org/hig/patterns/containers/utility-panes.html

Utility panes are vertical panels positioned on either side of a window. They differ from sidebars in their function and interaction patterns.

**When to Use**

Display supplementary controls, locations, or information adjacent to the primary window content through utility panes. Relevant content might include tool palettes, browsing history, spell-check findings, or document properties. Consider popovers as an alternative approach.

**Guidelines**

- **Positioning**: Place panes on the left if they influence the main view's content, or on the right if they serve a secondary role relative to the primary display.
- **Visibility**: Utility panes may be always visible or togglable by users, appearing only when specific features are active.
- **Header bar interaction**: Unlike sidebars, utility panes remain separate from the header bar without overlapping it.
- **Responsive design**: Enable utility panes to overlap the main content when horizontal space is limited, supporting adaptive layouts through flap widgets.
- **Keyboard shortcut**: When togglable, assign the F9 key for visibility control.

API Reference: Libadwaita `AdwOverlaySplitView`

#### Boxed Lists

Source: https://developer.gnome.org/hig/patterns/containers/boxed-lists.html

**Overview**

Boxed lists are a common list type containing both controls and information, suitable for app preferences or short document lists. They're appropriate for relatively small static lists; larger or dynamic lists should use list views instead.

**Guidelines**

Lists should be organized semantically using menu organization principles. Multiple lists can appear in the same view as different sections, with optional headings for each.

Row content options:
- Purely informational content
- Controls (maximum two per row)
- Links to other views (with `go-next-symbolic` arrow)

Design considerations:
- When controls are present, clicking the list background triggers the control
- Controls should be focusable; list rows should not be
- Differentiate multiple text elements using text size, weight and color
- Use symbolic-style icons to avoid visual overload
- Implement minimum and maximum widths for adaptive scaling

**Predefined List Rows**

- **Switch rows:** title, subtitle, and switch
- **Action rows:** title, subtitle, and control
- **Combo rows:** dropdown for single option selection
- **Entry rows:** text entry and editing
- **Spin rows:** number adjustment with plus/minus buttons
- **Property rows:** property name and value
- **Expander rows:** expand to reveal additional rows

**Editable Lists**

- **Adding:** use top button or add button row at list end
- **Removing:** place remove button at row end
- **Reordering:** include drag handles at row beginning OR use button menu with move/remove options (required for accessibility)

**Adding Buttons**

Include actions like add, delete, clear, or reset using pill buttons or button rows. Pill buttons suit single, prominent actions; button rows work for other cases or when the button is part of the list. Button row features: title, start icon, and end icon with standard button label guidance and ellipses or trailing arrows as appropriate.

API Reference: Libadwaita boxed-list documentation; GTK 4 `GtkListBox`

#### Grid Views

Source: https://developer.gnome.org/hig/patterns/containers/grid-views.html

Grid views display a grid of images, such as document thumbnails in a browser or selectable images in a background chooser.

**Guidelines**

- Each grid item should have a unique thumbnail wherever feasible.
- Arrange items based on user utility, with most recently added often being optimal.
- Visual styling should reduce distractions and showcase the content itself. When grid images have irregular shapes or inconsistent appearance, outlining each cell may be helpful.
- Offer a list view option to present alternative perspectives on the same content collection, where additional metadata like creation dates or authorship can be displayed.
- Since grids typically live in resizable windows, test across various window sizes and screen resolutions to ensure consistent appearance. Consider applying maximum width constraints to prevent awkwardly long rows.

API Reference: [GTK 4: GtkGridView](https://docs.gtk.org/gtk4/class.GridView.html)

#### List & Column Views

Source: https://developer.gnome.org/hig/patterns/containers/list-column-views.html

List views serve as an alternative to boxed lists and can accommodate large datasets with dynamic content. Column views extend this functionality with multiple columns and headers for sorting capabilities.

"List views are an alternative to boxed lists, which are able to handle very large lists of content, as well as those with dynamic content."

Both view types support text, images, and controls within rows. They share the same data model as grid views, enabling alternate presentations of identical content.

**General Guidelines**

- Maintain simplicity and consistency in row design, typically featuring one or two elements
- Use differentiated font sizes and weights when multiple text elements appear in a single row
- Apply symbolic icon styling when including icons
- Implement a default list order that prioritizes user utility
- Establish minimum and maximum widths to support adaptive scaling

**Column View Sorting**

Sorting indicators appear as directional arrows in column headers:

| Order | Arrow | Context |
|-------|-------|---------|
| Natural | Down | Alphabetical, ascending numbers, earliest dates, checked items first |
| Reverse | Up | Reverse alphabetical, descending numbers, recent dates, unchecked items first |

Clicking an unsorted header initiates natural order sorting. Subsequent clicks toggle to reverse order.

API Reference: GTK 4 `GtkListView`, `GtkColumnView`

#### Selection & Edit Modes

Source: https://developer.gnome.org/hig/patterns/containers/selection-mode.html

**Overview**

"Selection and edit modes operate in the context of a collection view — either a content grid or list, or a sidebar list — and provide a way to modify multiple content items."

These modes offer alternative interaction methods for collections and require explicit activation before use.

**Selection Mode**

Selection mode is recommended for applications managing large content collections where bulk operations are necessary. Examples include archiving multiple emails or selecting multiple photos for an album.

Selection mode should only be implemented when:
- The app contains large collections requiring frequent multi-item management
- Three or more actions can be performed on selected items

Implementation guidelines:
- Display checkboxes over items on hover in normal mode
- Secondary click or long press should also enable selection
- Once items are selected, activate selection mode automatically
- In active selection mode: clicking any item toggles its selection state; header bar displays a cancel button and selection count; action bar appears at screen bottom with available operations

**Edit Mode**

Edit mode suits scenarios where editing represents a distinct task separate from primary interactions. A playlist editor exemplifies this—playback is primary, editing is secondary.

Appropriate use cases:
- Small number of actions per item (typically 2-3)
- Actions can comfortably display overlaid or adjacent to items
- Editing is NOT the primary user interaction method

A dedicated edit button typically triggers this mode, with a "done" button for cancellation.

API Reference: GTK 4 `GtkActionBar`; Libadwaita `.selection-mode` style class

### Navigation (Patterns)

Source: https://developer.gnome.org/hig/patterns/nav.html

Combined with containers, the navigation design patterns create the structure of an app. See the navigation guidelines for more information.

Navigation patterns: **Browsing**, **View Switchers**, **Tabs**, **Sidebars**, **Search**.

#### Browsing

Source: https://developer.gnome.org/hig/patterns/nav/browsing.html

Browsing changes what is shown in a view. Users open views by clicking on content items or links, and can return to previous views using the back button.

Some apps use browsing as a key part of their navigation, such as in the case of web browsers and file managers. However, more limited forms of browsing can be used to navigate content structures within an app, such as for collections of content items, or multiple views of settings or information.

**Guidelines**

- In left-to-right locales, the standard position for the back button is the top-left. This position is an important part of recognition.
- Refer to the different general navigation guidelines when designing a navigation structure.
- Header bars should update to reflect what is being shown in the current view. This can include changing the heading, any controls, and switching between a primary and secondary menu.
- Support the standard keyboard shortcuts for navigation.

API Reference: [Libadwaita: AdwNavigationView](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1-latest/class.NavigationView.html)

#### View Switchers

Source: https://developer.gnome.org/hig/patterns/nav/view-switchers.html

**Overview**

A view switcher represents a control mechanism that facilitates switching among a restricted number of predetermined views. For instance, a music application might present distinct views for artists, albums, and playlists.

**Guidelines**

- **Quantity Rule**: As a general principle, view switchers should accommodate between three and five views. Should you require additional views, consider implementing a sidebar instead.
- **Labeling Standards**: Apply header capitalization when naming views, and prioritize nouns over verbs (examples: "Albums" or "Updates"). Maintain consistency in label length across all views.
- **Preferences Design**: When utilized for preference settings, avoid designing views where controls in one view influence controls in another. Users typically fail to recognize such interdependencies.
- **Activity Indicators**: View switcher buttons possess the capability to signal when a view contains activity. This might communicate that fresh content has become available.
- **Responsive Behavior**: View switchers should relocate to the lower window edge when the window narrows insufficiently to accommodate them in the header bar. The ViewSwitcher and ViewSwitcherBar widgets enable this functionality.

API Reference: Libadwaita `AdwViewSwitcher`, `AdwViewSwitcherBar`

#### Tabs

Source: https://developer.gnome.org/hig/patterns/nav/tabs.html

**Overview**

Tabs allow a window to contain a mutable set of content items, such as pages, documents or images. They are primarily used as part of editor or browser apps.

**Guidelines**

- Tabs can be assigned an icon and a label. Only use both if it is necessary.
- Where possible, ensure that tab labels are short and concise, and that the most useful part of the label is displayed first. This ensures that the label continues to be useful even when ellipsized.
- The presence of the tab bar can vary according to the role of tabs in your app. If tabs are integral to the app, the tab bar can always be shown. Alternatively, it can be hidden until there is more than one tab.
- Provide a context menu on each tab. This should include an item for "Move to New Window" if it is supported, and "Close" as the last item. Additional tab-specific features can be included, if they are present, including "Duplicate," "Pin"/"Unpin," "Mute" and "Reload."
- Avoid making reference to left and right directions in tab context menus, since these will be incorrect in right-to-left locales.

Tabs have a variety of features which can be used as appropriate. Many of these are more common in web browsers, but can be used elsewhere if needed. They include indicating that a tab needs attention, pinning/unpinning, and clickable indicator icons (primarily used for showing audio output and allowing it to be muted).

**Standard Keyboard Shortcuts**

| Shortcut | Action |
|----------|--------|
| Ctrl+T | Create a new tab |
| Ctrl+W | Close the current tab |
| Ctrl+Page Up | Switch to the next tab |
| Ctrl+PageDown | Switch to the previous tab |
| Ctrl+Home/End | Switch to first/last tab |
| Ctrl+Tab | Switch tabs |
| Alt+1–9 | Switch to one of the first nine tabs |

API Reference: Libadwaita `AdwTabBar`, `AdwTabView`, `AdwTabOverview`

#### Sidebars

Source: https://developer.gnome.org/hig/patterns/nav/sidebars.html

A sidebar is a vertical panel containing a list of different locations. Clicking each location navigates to it. "Sidebars are similar to utility panes, but they play a different role" and have distinct behaviors.

**When to Use**

Sidebars are appropriate when an application needs to display more views than a standard view switcher can accommodate. They work well for navigating between dynamic locations, such as in messaging applications, and suit contexts requiring frequent switching between different areas.

However, sidebars should not be used in applications that feature rich or immersive content, as they would distract from the primary content being displayed.

**Guidelines**

- **Ordering**: Structure the list based on user priorities. When sidebars contain many dynamic items, position recently updated items at the top.
- **Header bar placement**: Position any header bar controls affecting the sidebar list above the list itself.
- **Content density**: List rows can include multiple text lines and images. Ensure important information remains visible while maintaining a clean, attractive appearance.

API Reference: Libadwaita `AdwNavigationSplitView`

#### Search

Source: https://developer.gnome.org/hig/patterns/nav/search.html

Search functionality enables users to locate content items through filtering rather than browsing. This differs from the find feature, which highlights specific content within a view.

**When to Use**

Implement search when your application contains more content items than can reasonably fit on screen, particularly when those items include text-based information. Common scenarios include document collections, recent file lists, or location selection interfaces.

Search significantly improves user experience by providing a reliable discovery method that users anticipate encountering. However, search should not be the sole navigation option—alternative browsing methods remain essential since not all users will utilize search functionality.

**The Search Bar**

GNOME's standard search implementation uses a search bar that descends from below the header bar. In main application windows, this bar typically remains hidden until activated. Users can trigger search through three primary methods:

1. Typing text without focusing the search field (known as "type to search")
2. Using the keyboard shortcut Ctrl+F
3. Clicking a toggle button in the header bar

For applications where search represents a core feature, the search entry may be positioned permanently elsewhere and kept visible at all times.

**Search Results**

- "Search should be 'live' wherever possible — the content view should update to display search results as they are entered."
- Results must return promptly to maintain responsiveness
- Provide clear feedback when searches yield no matches
- Display results incrementally as they become available rather than delaying until all results are collected

**Additional Guidance**

- "Search should be global and return results from all views, as opposed to just returning results from the current view."
- Accommodate spelling variations through fuzzy matching or similarity suggestions
- Accept diverse search term formats to help users uncertain of exact terminology
- Rank results by relevance, placing most pertinent items first

API Reference: GTK 4 `GtkSearchBar`, `GtkSearchEntry`

### Controls

Source: https://developer.gnome.org/hig/patterns/controls.html

"Controls include the most basic interactive UI elements, such as buttons and switches."

Control types: **Buttons**, **Menus**, **Switches**, **Text Fields**, **Checkboxes**, **Radio Buttons**, **Drop-Down Lists**, **Sliders**, **Spin Buttons**, **Overlaid Controls**.

#### Buttons

Source: https://developer.gnome.org/hig/patterns/controls/buttons.html

**Overview**

Buttons represent one of the most fundamental and frequently used elements in user interface design.

**General Guidelines**

- Adhere to header bar button guidelines when placing buttons in header bars
- "Outside of header bars, buttons should contain either an icon or a label, and not both"
- Maintain consistency by limiting button width variations within a single window
- Avoid assigning actions to double-clicks or right-clicks
- "Make invalid buttons insensitive, rather than showing an error message when the user clicks them"
- Use imperative verbs with header capitalization for labels (examples: Save, Update)
- Keep labels brief to maintain narrow button widths and account for localization changes

**Toggle Buttons**

Toggle buttons shift between two states: set and unset, visually represented as either pressed or released.

These controls suit binary modes or settings and work well when space constraints exist, serving as an alternative to switches. Linked toggle buttons enable selection among multiple options and fit effectively in compact spaces such as list rows or header bars. When space permits, alternatives like radio buttons may be preferable.

**Button Styles**

Multiple predefined styles allow buttons to adapt to various contexts, and custom styles enable personalized appearances.

*Suggested & Destructive Actions* — Two colored styles convey specific meanings:
- **Suggested action**: "highlights a button for affirmative action" to draw focus to process progression or calls to action
- **Destructive action**: Functions as a warning, emphasizing potentially harmful consequences

"Each view should only ever include a single button using either the suggested or destructive styles."

*Alternative Shapes* — The pill and circular styles modify button appearance. "Pill can be used when a text button is situated in open space, and is a primary action for the view." Circular buttons suit scenarios with multiple smaller buttons positioned closely together.

API Reference: GTK 4 `GtkButton`, `GtkToggleButton`; Libadwaita Button Styles

#### Menus

Source: https://developer.gnome.org/hig/patterns/controls/menus.html

**General Guidelines**

Guidelines applying to all menus include standards for menu items and structure.

*Menu Items*
- Label menu items with verbs for commands and adjectives for settings, using header capitalization
- Menu items can include checkboxes and radio buttons
- Two linked actions can be combined into a single menu item by changing the label when selected (e.g., Play/Pause), but only when actions are logical opposites obvious to users
- Provide an access key for every menu item, avoiding duplication within the same menu

*Menu Size & Structure*
- Menus should contain between 3-12 items; submenus between 3-6 items
- Order items logically by importance, task order, or frequency of use
- Organize similar items into groups, keeping actions, checkboxes, and radio buttons separate
- Place single-item groups at top or bottom, or group together with other single items
- Avoid nesting submenus due to ergonomic and navigation difficulties

**Primary Menus**

Most apps include primary menus for standard features expected in every application.

- Use the `open-menu-symbolic` icon for the primary menu button
- Place primary menus at the end of the header bar (right side in Western locales), except: hide when using hierarchical navigation (unless other views need secondary menus); place above sidebars when present
- Menu button tooltip and accessibility label should refer to "Main Menu"

Standard primary menu items should appear in a grouped section at menu end:
- **Preferences**: Opens the app's preferences dialog
- **Keyboard Shortcuts**: Opens keyboard shortcuts dialog
- **Help**: Opens user documentation
- **About App**: Opens about dialog with app name

Do not include Close or Quit items in primary menus.

**Secondary Menus**

Secondary menus appear in the header bar for actions and settings related to specific views or content.

- Typically used with hierarchical navigation and sidebars
- Optional, needed only when sufficient actions or options justify a menu
- Generally avoid reproducing primary menu items like Preferences or About

API Reference: GTK 4 `GtkMenuButton`, `GtkPopoverMenu`

#### Switches

Source: https://developer.gnome.org/hig/patterns/controls/switches.html

Switches can be used for controlling features, settings or hardware that have a clear on/off logic.

**When to Use**

Switches are analogous to real-world controls, and this real-world correspondence can be used as a guide as to when a switch should be used.

On the whole, switches are preferred to checkboxes, since they offer a larger click target, often fit modern UI layouts better, and are more action orientated. However, checkboxes may still be used if a switch doesn't seem appropriate.

Only use a switch to control options that have a clear binary nature. If the switch label cannot adequately communicate what both states of the control do, a radio button may be a better choice.

**General Guidelines**

- Label switches with nouns using header capitalization. For example, *Automatic Location* or *Notifications*.
- Give the label an access key to allow users to focus the control using a keyboard.

**Switch States**

The active/inactive state of a switch is communicated by its background color, and this can be changed independently of the actual switch position. This can be used to communicate when a service or feature has been switched on, but has not yet come online. This technique can be particularly useful when there's a delay between the switch being toggled and it having an effect.

If a feature has been disabled or is unavailable, it is better to make the switch insensitive, since this avoids the suggestion that the service ought to respond to user action.

API Reference: [GTK 4: GtkSwitch](https://docs.gtk.org/gtk4/class.Switch.html)

#### Text Fields

Source: https://developer.gnome.org/hig/patterns/controls/text-fields.html

Text fields allow single line text entry and editing.

**When to Use**

Use text fields for actions that require text input, such as search or messaging. Text fields can also be used for forms or preferences, though in these cases, an entry row will often be preferable.

**Guidelines**

- Text fields should have placeholder text or a label. "Placeholder text is often preferred over labels, since it allows more elegant UI layouts." However, labels should be used if the purpose of a text field is not clear while it contains text.
- Text field labels should use header capitalization, and have an access key assigned to the label, to allow people to focus the control using a keyboard.
- Placeholders can be phrased in the same way as labels. Alternatively, if the text field performs an action, they can be phrased as an instruction, followed by ellipses. For example: "Search for a city…" or "Write a message…".
- Size text fields according to the likely size of the content they will contain. This gives a useful visual cue to the amount of expected input.
- When a text field contains a property or setting, apply any changes when Return is pressed or when the field loses focus.
- Buttons and icons can be embedded inside text fields. This can be helpful to provide feedback (for example, a spinner to indicate progress) or common actions (for example, a clear button). Embedded buttons and icons should use the symbolic style.

**Text Validation**

"It is generally better to show positive feedback when the content is valid, as opposed to showing negative feedback while it is invalid." This avoids distracting users during editing. Show feedback in real time as the field is edited, rather than waiting until the field loses focus.

**Password Fields**

Password fields are a special type of text field with a dedicated control that hides entered text, which can be revealed with a button, and can be used for any potentially sensitive text.

**Automatic Suggestions**

"It is often helpful to suggest potential text to be entered as the user types into a text field." This reduces user effort and errors.

**Tags**

Tags or tokens are a typical convention for some types of text field. For example, the *To* field in an email app will often display each recipient as a tag. This aids readability and makes it easy to remove each item from the field. Currently, entry tags require a custom implementation.

API Reference: GTK 4 `GtkEntry`, `GtkTextView`, `GtkPasswordEntry`

#### Checkboxes

Source: https://developer.gnome.org/hig/patterns/controls/checkboxes.html

**Overview**

Checkboxes enable users to manage binary options or properties. Switches are preferred to checkboxes in general, though checkboxes may be more appropriate in specific contexts.

**Guidelines**

*Checkbox Label Guidelines*
- Apply sentence capitalization to checkbox labels (e.g., "Use custom font")
- Labels should communicate both checked and unchecked states clearly, such as "Show icons in menus"
- If both states cannot be clearly expressed, consider using radio buttons instead
- Steer clear of negative phrasing; "Play alert sound" works better than "Disable alert sound"

*Additional Checkbox Guidelines*
- Toggling a checkbox should not change other control values, though it may alter their sensitivity or visibility
- When a checkbox affects other controls' sensitivity, position it directly above those dependent controls to show the relationship

**Mixed States**

Checkboxes representing properties across multiple items may display a mixed state when the setting applies to some—but not all—selected items.

Clicking a mixed-state checkbox produces three outcomes:
1. **First click**: Enables the checkbox and applies the setting to all selected objects
2. **Second click**: Disables the checkbox and removes the setting from all selected objects
3. **Third click**: Returns to mixed state, restoring each object's original setting value

API Reference: GTK 4 `GtkCheckButton`

#### Radio Buttons

Source: https://developer.gnome.org/hig/patterns/controls/radio-buttons.html

Radio buttons enable users to select one option from a set of choices.

**When to Use**

Radio buttons work well because each option receives its own label, making them suitable when options aren't mutually exclusive (such as sorting choices by author versus date). This characteristic makes them preferable to switches for these scenarios.

Since radio buttons present all options visibly without requiring disclosure, they suit small option collections best. When dealing with larger option sets, a drop-down list typically serves users better.

**Guidelines**

At least one button should always remain selected within a set, with one exception: when a radio button represents an attribute shared across multiple items where some possess it and others don't, display the button in a mixed state.

Apply sentence capitalization to radio button labels—for example, "Single click to open."

API Reference: [GTK 4: GtkCheckButton](https://docs.gtk.org/gtk4/class.CheckButton.html)

#### Drop-Down Lists

Source: https://developer.gnome.org/hig/patterns/controls/drop-downs.html

**Overview**

"Drop-down lists are used to select an item from a mutually exclusive set of options." A demonstration is available in the GTK 4 demo application under Lists → Selections.

**When to Use**

Drop-down lists work best when meeting these criteria:
- The available options are extensive
- The hidden menu contents are predictable from the label and selected item (such as a "Month" dropdown showing "January")
- Space is limited, particularly in header bars

When these conditions don't apply, radio buttons may provide a superior alternative since they display all choices without requiring user interaction to reveal them.

**Guidelines**

- Avoid using drop-down lists for fewer than three options; use radio or toggle buttons for binary choices instead
- Apply sentence capitalization to labels and provide an access key for focus management
- Use sentence capitalization consistently for list items
- Assign unique access keys to all items within the containing window or dialog

API Reference: GTK 4 `GtkDropDown`

#### Sliders

Source: https://developer.gnome.org/hig/patterns/controls/sliders.html

**Overview**

A slider enables quick selection of a value from a range. Common applications include seeking through audio or video, adjusting volume levels, or setting values in image editors.

**When to Use**

Implement a slider when these conditions apply:
- The range of values is fixed and ordered
- Adjusting the value relative to its current state takes priority over selecting an absolute value
- Real-time control of value changes proves useful for the user
- The number of potential values is high

For ranges lacking fixed maximum and/or minimum boundaries, consider using a spin button instead.

**Guidelines**

- **Real-time feedback**: Provide immediate feedback as the slider position changes, enabling users to make informed adjustments (such as speaker volume or live image editor feedback).
- **Follow conventions**: Adhere to placement standards when applicable. For instance, video players typically position horizontal seek bars at the bottom of the window, which serves as sufficient identification. In other contexts, use text labels or icons to identify the slider.
- **Mark significant values**: Consider marking important points along the slider using text or tick marks. An audio balance control might mark left, right, and center positions.
- **Exact value input**: When precise values are needed, pair the slider with a linked text field or spin button for direct value entry.

API Reference: [GTK 4: GtkScale](https://docs.gtk.org/gtk4/class.Scale.html)

#### Spin Buttons

Source: https://developer.gnome.org/hig/patterns/controls/spin-buttons.html

**Overview**

A spin button functions as a text field designed to accept numeric values within a defined range, accompanied by increment and decrement buttons that adjust the value by predetermined amounts.

**When to Use Spin Buttons**

Implement a spin button specifically when users require precise numeric input with meaningful values. For situations where exact numbers matter less than relative positioning, consider using a slider alternative instead.

**General Guidelines**

*Labeling and Accessibility*
- Apply sentence capitalization to spin button labels
- Include an access key within labels to enable direct focus navigation

*Value Display*
- "Right-justify the content of spin boxes, unless the convention in the user's locale demands otherwise" to facilitate numeric comparisons when controls appear in vertical arrangements

*Integration with Sliders*

Combine spin buttons with sliders only when:
- Both approximate and precise value control benefit the user experience
- Real-time feedback updates occur when spin box values change
- Users benefit from controlling value modification rates dynamically

API Reference: [GTK 4: GtkSpinButton](https://docs.gtk.org/gtk4/class.SpinButton.html)

#### Overlaid Controls

Source: https://developer.gnome.org/hig/patterns/controls/overlaid.html

**Overview**

Overlaid Controls represent UI elements that are typically semi-transparent and positioned over window content, in contrast to standard opaque controls that remain permanently visible.

**When to Use**

This pattern suits scenarios where reducing visible controls improves the user experience when inactive. Video player applications exemplify this approach, delivering an unobstructed viewing experience.

However, overlaid controls may prove problematic when they obstruct content they're layered above. Image editing controls may interfere with the ability to see their effects, making traditional visible controls preferable in such contexts.

**Guidelines**

- Adhere to established design conventions specific to each control type—such as directional browse buttons in image viewers or player controls positioned at the bottom edge for video applications
- Display controls when users move the pointer over content or engage via touch interaction
- Position overlaid controls either attached to window/content edges or as independent floating elements

API Reference: Libadwaita `.osd` style class; GTK 4 `GtkOverlay`

### Feedback

Source: https://developer.gnome.org/hig/patterns/feedback.html

"Feedback includes design patterns for showing information about events and status, as well as for prompting users for a response."

Feedback patterns: **Notifications**, **Toasts**, **Banners**, **Progress Bars**, **Spinners**, **Dialogs**, **Placeholder Pages**, **Tooltips**.

#### Notifications

Source: https://developer.gnome.org/hig/patterns/feedback/notifications.html

Notifications serve as a communication mechanism to keep users informed about relevant events, even when using other applications. Examples include completion of downloads, availability of new content, and incoming messages.

**General Guidelines**

- **Avoid overuse**: "Be careful not to needlessly distract users with notifications, and question whether users really need to be informed about the events you want to communicate."
- **Manage frequency for high-volume apps**: For applications handling many events (email, social media), consider summarizing notifications rather than showing individual alerts, and provide user controls to disable or reduce notifications.
- **Remove outdated notifications**: Clear notifications that are no longer valid, such as revoked weather warnings or read emails.
- **Don't rely solely on notifications**: "The app window should independently communicate all the information contained in notifications."

**Notification Elements**

| Element | Purpose |
|---------|---------|
| App Icon | Identifies the source application |
| Title | Concise summary using header capitalization; should be understandable alone |
| Body | Optional supplementary detail in sentence capitalization |
| Default Action | Triggered by clicking the notification body; dismisses and shows relevant app content |
| Actions | Up to three buttons for quick user responses |

**Notification Actions Guidelines**

- Only include buttons when functionality is frequently needed
- Actions should relate directly to notification content
- Actions shouldn't replace standard UI controls
- Avoid duplicating default actions (e.g., don't include an "Open" button if the default action already opens)

API Reference: GIO `GNotification`

#### Toasts

Source: https://developer.gnome.org/hig/patterns/feedback/toasts.html

**Overview**

Toasts are popup banners containing a label and sometimes a button. They are transient and user dismissible components.

**When to Use**

Toasts display messages and actions within an app context, typically responding to user actions. A common application is showing an undo option after destructive operations.

Since toasts are temporary, they work best for individual events rather than ongoing states. For persistent information, consider using banners instead.

Toasts only appear within an app's window, making them suitable only for feedback relevant during active app use. If a message needs visibility when the app isn't running, notifications are more appropriate.

**Guidelines**

- Each toast requires a brief, straightforward title
- Include a button only when it directly relates to the message and provides general utility
- Position toasts toward the bottom of the parent window, horizontally centered, without overlaying specific areas
- Toast titles should follow "informal heading style" conventions

API Reference: Libadwaita `AdwToast`

#### Banners

Source: https://developer.gnome.org/hig/patterns/feedback/banners.html

A banner is a visual strip positioned at the top of a view containing a title and optional button. These components communicate persistent states to users.

**Purpose**

Banners serve to indicate ongoing conditions such as offline status or read-only document modes. They can also present supplementary information about special locations or content.

**When to Use**

Banners remain visible continuously, making them suitable for persistent state communication and location-specific details. However, they should not be used for transient messages—use notifications or toasts for temporary information instead.

Since banners demand attention, reserve them for conveying truly important information only.

**Guidelines**

Banner titles should be concise and formatted using informal heading style. Keep text direct and factual rather than explanatory.

Recommended title examples include:
- "Metered network ‒ automatic updates paused"
- "Unlock to change settings"
- "Working offline"

API Reference: Libadwaita `AdwBanner`

#### Progress Bars

Source: https://developer.gnome.org/hig/patterns/feedback/progress-bars.html

**Overview**

Progress bars serve to indicate task completion progress. As stated in the guidelines: "Progress bars indicate progress on a task. Unlike spinners, they typically indicate the proportion of the task that has been completed."

The appropriate use case involves longer operations—roughly those exceeding 30 seconds. Shorter tasks benefit more from spinner indicators instead.

**The Bar**

The progress bar should communicate remaining time for task completion. When feasible, this calculation should be accurate. If precise estimation is impossible, the bar can:
- Pause at 100% with explanatory text like "Almost done" (for overestimation scenarios)
- Skip ahead as needed (for underestimation scenarios)
- Enter activity mode for unknown durations, though "activity mode should be avoided wherever possible, particularly for long periods of time"

**Progress Text**

Labels should describe completion status using task-appropriate units such as "13 of 19 images rotated" or "12.1 of 30 MB downloaded."

For extended operations, time estimates are beneficial. When uncertain: "If the time remaining is an estimate, use the word 'about'. For example, 'About 3 minutes left'."

**Task Stages**

Multi-stage tasks should show combined time estimates for the entire operation rather than individual stage breakdowns, unless users specifically need that information.

**Subtasks**

Combined progress bars work best for simultaneous subtasks. Show individual progress bars only when users need to monitor or control each subtask separately.

**Thin Progress Bars**

Background operations can use thinner variants attached to header bars without accompanying status text.

**General Guidelines**

- Include pause/cancel options for destructive or resource-intensive operations
- Display progress bars inline with related content
- Avoid separate progress windows, as they obscure controls and create UI ambiguity

#### Spinners

Source: https://developer.gnome.org/hig/patterns/feedback/spinners.html

Spinners indicate ongoing progress on an action or operation.

**When to Use**

Progress needs to be indicated whenever an operation takes more than around three seconds. This communicates that the operation is taking place and that an error hasn't occurred. If an operation takes less than three seconds, it isn't necessary to indicate progress.

Spinners do not display the proportion of the task that has been completed, or the time remaining. They are therefore better-suited to shorter operations. If the task is likely to take more than 30 seconds, a progress bar might be a better choice.

**General Guidelines**

- It is better not to show spinners for very short periods of time, since briefly displayed animated elements distract from the overall user experience. If an operation can vary in how long it takes, consider only showing the spinner after a period of time has elapsed.
- Place progress spinners close to or within the user interface elements they relate to.
- Generally, only one progress spinner should be displayed at once. Avoid showing numerous spinners simultaneously.
- A label can be shown next to a spinner, if it is helpful to clarify the task which a spinner relates to.
- If a spinner is displayed for a relatively long time, a label can be added to indicate progress. This can take the form of a percentage, an indication of the time remaining, or progress through sub-components of the task (for example, items downloaded or pages exported).

API Reference: [GTK 4: GtkSpinner](https://docs.gtk.org/gtk4/class.Spinner.html)

#### Dialogs

Source: https://developer.gnome.org/hig/patterns/feedback/dialogs.html

**Overview**

Dialog windows present options, choices or information to users, which they must respond to in order to continue. GNOME supports two primary dialog types: alert dialogs and action dialogs.

**Alert Dialogs**

Alert dialogs display a message or question accompanied by one to three response buttons. They're appropriate when user acknowledgment is essential, though they are disruptive and alternatives should be considered.

*Confirmation Dialogs* — Confirmation dialogs verify that users want to proceed with an action before executing it. They contain two buttons: one to confirm and one to cancel.

"Destructive actions should always be accompanied by either a confirmation dialog or an offer to undo the action" typically via toast notifications. Undo features are generally preferable because they avoid interrupting users and enable error recovery.

*Error Dialogs* — Error dialogs present error messages, often with a single close button. They should be minimized where feasible, as they disrupt workflow. Simple non-critical errors work better as toasts.

**Action Dialogs**

Action dialogs present options and information before executing an action. Print and Save dialogs exemplify this category.

Key characteristics include:
- Header bar with action description
- Two primary buttons: one to execute, one to cancel
- Affirmative button labeled with specific verbs (Save, Print) rather than generic terms (OK, Done)
- Affirmative button should be insensitive until required options are selected

**General Guidelines**

*Dialog Behavior*
- Never display dialogs unexpectedly; they should appear only in response to deliberate user actions
- Dialogs must have a parent window and be modal
- Provide initial keyboard focus to the first expected user interaction point

*Button Guidelines*
- Cancel button appears first (left in left-to-right locales)
- Assign the Return key to activate the affirmative button, except for irreversible or destructive actions
- Bind the Esc key to the cancel button

API Reference: Libadwaita `AdwAlertDialog`

#### Placeholder Pages

Source: https://developer.gnome.org/hig/patterns/feedback/placeholders.html

Placeholder pages are UI elements that populate empty views with an image, heading, and optional descriptive text. They serve as a way to fill spaces that would normally display content.

**Styles**

Two placeholder styles exist:
- **Illustration**: Uses colorful graphics
- **Symbolic**: Uses simple monochrome icons

**When to Use**

"Placeholder pages with the illustration style are primarily used in the main view of an app, when it is empty." They help avoid awkward empty states during initial app use and can provide guidance while establishing user rapport.

"Symbolic placeholder pages should be used in other spaces that might often contain content, but which are empty, such as empty folders, albums or search results views."

**Guidelines**

- Include a heading communicating the empty state (e.g., "Empty Folder")
- Add descriptive text offering guidance on adding items
- Consider including action controls like suggested buttons for relevant tasks
- For illustration placeholders used in onboarding: use rich, colorful imagery with positive, upbeat text
- For symbolic placeholders: maintain subtle appearance using default icon colors and neutral text tone

API Reference: Libadwaita `AdwStatusPage`

#### Tooltips

Source: https://developer.gnome.org/hig/patterns/feedback/tooltips.html

**Overview**

Tooltips can be applied to any UI element and primarily convey additional information about control functions, particularly icon buttons. They may also display supplementary details about app content.

**When to Use**

All controls in primary window header bars require tooltips. In other contexts, tooltips should only appear when genuinely beneficial—either providing sought-after information or enhancing user experience. Useful examples include displaying full URLs for links or revealing syntax errors in code editors.

Keep tooltip usage minimal otherwise, as they can obstruct interaction inadvertently and lack accessibility on touch devices. Never depend on tooltips to communicate essential information.

**Important guideline:** "If a tooltip is provided for one control in a container, all other controls in that container should also have tooltips."

**Tooltip Text**

Labels should be brief and use header capitalization. Examples of effective tooltips: Recently Used Documents, Grid View, Fullscreen.

When controls already have labels, avoid repetition. Provide supplementary information or rephrase instead:

| Button Label | Tooltip |
|---|---|
| Open… | Select a File |
| Add user… | Create an Account |
| Connect | Open Address |

**Standard Tooltip Labels**

| Control | Tooltip | Notes |
|---|---|---|
| Go back button | Back | — |
| Search | Search | Can specify content type (e.g., "Search Documents") |
| Primary menu | Main Menu | Specify applicable item when possible |
| Secondary menu | Menu | — |
| New tab | New Tab | — |
| Open bookmarks | Bookmarks | — |

API Reference: GTK 4 `GtkTooltip`

---

## Reference

Source: https://developer.gnome.org/hig/reference.html

Three main resources: **Standard Keyboard Shortcuts**, **Palette**, **Backgrounds**.

### Standard Keyboard Shortcuts

Source: https://developer.gnome.org/hig/reference/keyboard.html

"When providing keyboard shortcuts, the following conventions should be adhered to, in order to ensure consistency between apps."

**Basic Shortcuts**

| Action | Shortcut | Description |
|--------|----------|-------------|
| Close | Ctrl+W | Closes the current tab or window |
| Quit | Ctrl+Q | Closes the app, including all its windows |
| Help | F1 | Opens the help app on the page for the app |
| Side Pane | F9 | Toggles utility pane visibility |
| Menu | F10 | Opens the primary or secondary menu |
| Keyboard Shortcuts | Ctrl+? | Opens the keyboard shortcuts dialog |
| Preferences | Ctrl+, | Opens the preferences window |

**Content & Files**

| Action | Shortcut | Description |
|--------|----------|-------------|
| New | Ctrl+N | Creates a new content item, sometimes in a new window or tab |
| Open | Ctrl+O | Opens an existing content item, often by presenting the open file dialog |
| Save | Ctrl+S | Saves the current content item |
| Save As | Shift+Ctrl+S | Saves the current content item with a new filename |
| Print | Ctrl+P | Prints the current content item and opens the print dialog |
| Print Preview | Shift+Ctrl+P | Shows a print preview of the current content item |
| Send | Ctrl+M | Sends or shares the current content item |
| Properties | Alt+Return | Shows properties for the current content item |

**Editing**

| Action | Shortcut | Description |
|--------|----------|-------------|
| Undo | Ctrl+Z | Reverts the last taken action |
| Redo | Shift+Ctrl+Z | Performs the last taken action, if previously reverted |
| Cut | Ctrl+X | Removes the selected content and adds it to the clipboard |
| Copy | Ctrl+C | Copies the selected content to the clipboard |
| Paste | Ctrl+V | Inserts the contents of the clipboard |
| Paste Special | Shift+Ctrl+V | Inserts a non-default version of the clipboard content |
| Duplicate | Ctrl+U | Creates a duplicate of the selected object |
| Select All | Ctrl+A | Selects all content in the focused control or view |
| Deselect All | Shift+Ctrl+A | Deselects all content in the focused control or view |
| Find | Ctrl+F | Shows and focuses a find/search UI |
| Find Next | Ctrl+G | Selects the next find/search result |
| Find Previous | Shift+Ctrl+G | Selects the previous find/search result |
| Replace | Ctrl+H | Shows and focuses a find and replace UI |

**View Options**

| Action | Shortcut | Description |
|--------|----------|-------------|
| Zoom In | Ctrl++ | Enlarges the content in the view |
| Zoom Out | Ctrl+- | Reduces the content in the view |
| Normal Size | Ctrl+0 | Resets the zoom level to the default |
| Reload | Ctrl+R | Reloads the current view or content item |

**Formatting**

| Action | Shortcut | Description |
|--------|----------|-------------|
| Bold | Ctrl+B | Toggles bold formatting for the current text selection |
| Italic | Ctrl+I | Toggles italicisation for the current text selection |
| Underline | Ctrl+U | Toggles the underlining of the current text selection |

**Bookmarking**

| Action | Shortcut | Description |
|--------|----------|-------------|
| Add Bookmark | Ctrl+D | Adds a bookmark for the current location |
| Edit Bookmarks | Ctrl+Alt+D | Opens the bookmark list |

**Navigation**

| Action | Shortcut | Description |
|--------|----------|-------------|
| Back | Alt+← | Navigates to the previous location |
| Forward | Alt+→ | Navigates to the next location in the navigation history |
| Up | Alt+↑ | Navigates to the parent location |
| Home | Alt+Home | Navigates to the starting location |
| Enter Location | Ctrl+L | Allows the user to specify an address or URI |
| Previous Page | PageUp | Navigates to the previous page |
| Next Page | PageDown | Navigates to the next page |
| First Page | Ctrl+Home | Navigates to the first page |
| Last Page | Ctrl+End | Navigates to the last page |

**Legacy System Reserved Shortcuts**

The following shortcuts should be avoided by apps, since they are used by the system.

| Keys | Function |
|------|----------|
| Alt+Tab, Shift+Alt+Tab | Switches to the next/previous window |
| Alt+Tab+\`, Shift+Alt+Tab+\` | Switches to the next/previous window of the focused app |
| Alt+F4 | Close the focused window |
| Alt+F6, Shift+Alt+F6 | Switches to the next/previous window of the focused app |
| Alt+F7 | Moves the focused window |
| Alt+F8 | Resizes the focused window |
| Alt+F5 | Unmaximizes the focused window |
| Ctrl+Alt+Tab, Shift+Ctrl+Alt+Tab | Switches between system areas |
| Alt+Space | Opens window menu |
| Ctrl+Alt+Delete | System power off |

**Sections**

In the keyboard shortcuts dialog, shortcuts should be categorized into sections. "Although not present on the GNOME desktop, section titles and categorization should follow menu bar conventions with the exception that more general shortcuts should go in 'General' instead of 'File'." If a section becomes too lengthy, it may be subdivided using unnamed sections.

### Palette

Source: https://developer.gnome.org/hig/reference/palette.html

"The GNOME color palette is intended for use in app icons and illustrations." The palette can be accessed through the Palette app, GIMP and Inkscape, or by downloading it in GIMP/Inkscape format.

| Name | RGB | Hexadecimal |
|------|-----|-------------|
| Blue 1 | (153, 193, 241) | #99c1f1 |
| Blue 2 | (98, 160, 234) | #62a0ea |
| Blue 3 | (53, 132, 228) | #3584e4 |
| Blue 4 | (28, 113, 216) | #1c71d8 |
| Blue 5 | (26, 95, 180) | #1a5fb4 |
| Green 1 | (143, 240, 164) | #8ff0a4 |
| Green 2 | (87, 227, 137) | #57e389 |
| Green 3 | (51, 209, 122) | #33d17a |
| Green 4 | (46, 194, 126) | #2ec27e |
| Green 5 | (38, 162, 105) | #26a269 |
| Yellow 1 | (249, 240, 107) | #f9f06b |
| Yellow 2 | (248, 228, 92) | #f8e45c |
| Yellow 3 | (246, 211, 45) | #f6d32d |
| Yellow 4 | (245, 194, 17) | #f5c211 |
| Yellow 5 | (229, 165, 10) | #e5a50a |
| Orange 1 | (255, 190, 111) | #ffbe6f |
| Orange 2 | (255, 163, 72) | #ffa348 |
| Orange 3 | (255, 120, 0) | #ff7800 |
| Orange 4 | (230, 97, 0) | #e66100 |
| Orange 5 | (198, 70, 0) | #c64600 |
| Red 1 | (246, 97, 81) | #f66151 |
| Red 2 | (237, 51, 59) | #ed333b |
| Red 3 | (224, 27, 36) | #e01b24 |
| Red 4 | (192, 28, 40) | #c01c28 |
| Red 5 | (165, 29, 45) | #a51d2d |
| Purple 1 | (220, 138, 221) | #dc8add |
| Purple 2 | (192, 97, 203) | #c061cb |
| Purple 3 | (145, 65, 172) | #9141ac |
| Purple 4 | (129, 61, 156) | #813d9c |
| Purple 5 | (97, 53, 131) | #613583 |
| Brown 1 | (205, 171, 143) | #cdab8f |
| Brown 2 | (181, 131, 90) | #b5835a |
| Brown 3 | (152, 106, 68) | #986a44 |
| Brown 4 | (134, 94, 60) | #865e3c |
| Brown 5 | (99, 69, 44) | #63452c |
| Light 1 | (255, 255, 255) | #ffffff |
| Light 2 | (246, 245, 244) | #f6f5f4 |
| Light 3 | (222, 221, 218) | #deddda |
| Light 4 | (192, 191, 188) | #c0bfbc |
| Light 5 | (154, 153, 150) | #9a9996 |
| Dark 1 | (119, 118, 123) | #77767b |
| Dark 2 | (94, 92, 100) | #5e5c64 |
| Dark 3 | (61, 56, 70) | #3d3846 |
| Dark 4 | (36, 31, 49) | #241f31 |
| Dark 5 | (0, 0, 0) | #000000 |

### Backgrounds

Source: https://developer.gnome.org/hig/reference/backgrounds.html

**Overview**

These guidelines are intended for Linux distributions creating background wallpapers for GNOME, documenting technical considerations for design and creation.

**Image Size**

"The recommended size for wallpaper images is 4096×4096px." This dimension accommodates high-resolution displays, ultrawide, and portrait orientations.

**Scaling and Cropping**

GNOME employs the "zoom" method for backgrounds: images scale to displays while maintaining aspect ratio, with maximum visibility. The center portion is guaranteed visibility across all displays, while edges may be cropped.

Key considerations include:
- System interface elements overlay the background
- A 4096×4096px image on 1920×1200px displays shows cropped results
- Landscape aspect ratios (32/9, 16/9, 4/3) crop differently than portrait
- Testing across various resolutions and orientations is recommended
- An overlay image is available for design testing

**Lock Screen**

Background images appear on GNOME's lock screen in blurred form with UI elements overlaid. The interface initially displays time and date, then transitions to a login prompt when authenticating.

Design considerations:
- Backgrounds should appear visually appealing when blurred
- Avoid muddy or overly diffuse results after blurring
- Strong visual elements shouldn't appear unbalanced
- Ensure elements don't conflict with lock screen UI components

**Light and Dark Mode**

Starting with GNOME 42, designers can provide separate light and dark background variants. While optional, offering this feature across multiple backgrounds supports GNOME's dark mode functionality.

Recommendations include:
- Treating both variants as equal design pairs
- Avoiding artificial-looking results when processing photographs
- Linking both versions in XML definitions
