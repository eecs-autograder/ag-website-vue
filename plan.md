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
- Grading right bar:
  - [] Add checkbox role & keyboard control to criteria visual checkboxes
  - [] Change applied annotation "delete" x to an unstyled button
  - [x] Form input label association for "adjust points"
  - [] Form input label association for "comments"
  - [] "Checkboxes", "Comments", and "Annotations" sub-headers
    - [x] Add keyboard focus & controls (use CollapsibleSection component)
    - [x] Use h2 tags
    - [] Stretch: Add keyboard shortcuts for prev/done/next/done+next
- Keyboard mechanism for applying annotations:
  - Brainstorm design options
    - Add button to file panel header; button opens modal w/
      annotation <select> tag or similar, first & last line
      inputs (last line optional)
      - Notes:
        - Text width is a potential issue with select tag
        - Line number entering should have bounds-checking
    - Make annotation cards in right-side grading panel clickable.
      Clicking opens modal or inline form (better) to enter line numbers
      - Notes:
        - Line number entering should have bounds-checking
        - Should Annotations right-side section start expanded?
  - Add link to navigate from handgrading admin to project page
    handgrading tab
