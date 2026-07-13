TODO:
- Left Sidebar:
  - [x] Sidebar menu collapse keyboard control (Use unstyled button)
  - [x] Sidebar region marker (see submission_list.vue for example)
  - [x] Sidebar group list keyboard navigability
  - [x] Filter menu keyboard navigability
  - [x] Darken colors for ungraded and in progress group names text (group
    summary panel component)
- Grading body:
  - [x] Tab focus & keyboard control for collapsible file panels (Add
    directly to file_panel.vue
    - [x] Aria expanded/controls
  - [x] Add region role & label to danger zone message
  - View file:
    - [x] Use unstyled button for delete comment/applied annotation x
- Grading right bar:
  - [x] Use checkbox inputs for handgrading criteria
  - [x] Change applied annotation and comment "delete" x to an unstyled button
  - [x] Form input label association for "adjust points"
  - [x] Form input label association for "comments"
  - [x] "Checkboxes", "Comments", and "Annotations" sub-headers
    - [x] Add keyboard focus & controls (use CollapsibleSection component)
    - [x] Use h2 tags
- Keyboard mechanism for applying annotations:
  - Brainstorm design options
    ~~- Add button to file panel header; button opens modal w/~~
    ~~  annotation <select> tag or similar, first & last line~~
    ~~  inputs (last line optional)~~
    ~~  - Notes:~~
    ~~    - Text width is a potential issue with select tag~~
    ~~    - Line number entering should have bounds-checking~~
    ~~- Make annotation cards in right-side grading panel clickable.~~
    ~~  Clicking opens modal or inline form (better) to enter line numbers~~
    ~~  - Notes:~~
    ~~    - Line number entering should have bounds-checking~~
    ~~    - Should Annotations right-side section start expanded?~~
    ~~    - Comment form needs optional line number inputs added to it~~
    ~~- [] **Decision**: Integrate line-specific annotating to comment form~~
    ~~  - [] Add select element to comment form. Options are "custom comment" (selected by default & last in list)~~
    ~~  - [] Add select file ~~
    ~~  - [] Add start & end line number inputs. ~~
    ~~    - These are optional for "custom comment". ~~
    ~~      - No line numbers specified means comment not associated with a line (start and end line ~~are null)
    ~~    - End line number is always optional. Not present means start and end are same.~~
    ~~      - Note: In the API~~
    - **Decision**: After adding keyboard support to context menu, make lines of code focusable and so that enter opens the menu.
  - Add link to navigate from handgrading admin to project page
    handgrading tab
