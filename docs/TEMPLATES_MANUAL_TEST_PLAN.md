# Templates Feature - Manual Test Plan

## Document Information
**Feature:** Templates Management  
**Version:** 1.0  
**Created:** October 28, 2025  
**Status:** Ready for Testing  
**Total Test Cases:** 44  

## Test Environment Setup

### Prerequisites
- Ensure the app is running in development mode
- Have the FitnessTracker app open and logged in
- Navigate to the Templates tab (Workout Stack)
- Have access to AsyncStorage inspection tools (optional)

### Test Data Requirements
- Fresh install OR cleared AsyncStorage for testing empty states
- At least one user-created template for edit/delete tests

---

## Test Categories

### 1. VIEWING TEMPLATES

| Test Case ID | Test Case Description | Steps to Reproduce | Expected Result |
|--------------|----------------------|-------------------|-----------------|
| VIEW-01 | View Preset Templates on Initial Load | 1. Launch app and log in<br>2. Navigate to Templates tab | - Display "Explore Presets" section<br>- Show 4 preset templates (PPL Push, Pull, Legs, HIIT Cardio)<br>- Each template shows name, description, exercise count, difficulty, estimated time<br>- Preset badge displayed on each card |
| VIEW-02 | View Empty User Templates | 1. Navigate to Templates tab<br>2. Ensure no user templates exist (fresh install or cleared data) | - Display "My Templates" section<br>- Show empty state with message "No user templates"<br>- Empty state icon displayed |
| VIEW-03 | View User Templates After Creation | 1. Create a new template (see CREATE tests)<br>2. Return to Templates screen | - Display created template in "My Templates" section<br>- Template shows name, description, exercise count<br>- Edit and Delete buttons visible on template card |
| VIEW-04 | Pull to Refresh Templates | 1. Navigate to Templates screen<br>2. Pull down on the screen to refresh | - Loading indicator appears<br>- Templates list refreshes<br>- All templates remain visible after refresh |
| VIEW-05 | View Template Details | 1. Tap on any template card (not action buttons) | - Navigate to WorkoutLobby screen with selected template<br>- Template data passed correctly |

---

### 2. CREATING TEMPLATES

| Test Case ID | Test Case Description | Steps to Reproduce | Expected Result |
|--------------|----------------------|-------------------|-----------------|
| CREATE-01 | Open Create Template Screen | 1. Navigate to Templates screen<br>2. Tap "+ Create New" button in header | - Navigate to Template Editor screen<br>- Title shows "Create Template"<br>- Empty form with Name and Description fields<br>- "Add Exercise" button visible<br>- Empty state shown for exercises section |
| CREATE-02 | Open Exercise Selector | 1. In Template Editor (create mode)<br>2. Tap "+ Add Exercise" button | - Exercise Selector modal opens<br>- Display list of 70+ exercises<br>- Search bar visible<br>- Footer shows exercise count<br>- Each exercise shows name, muscle group, equipment |
| CREATE-03 | Search Exercises | 1. Open Exercise Selector<br>2. Type "bench" in search bar | - Filter exercises to show only matching results (e.g., "Barbell Bench Press")<br>- Results update as you type<br>- Clear button (X) appears in search bar |
| CREATE-04 | Clear Exercise Search | 1. Search for exercises<br>2. Tap clear button (X) in search bar | - Search input cleared<br>- Full exercise list restored |
| CREATE-05 | Add Exercise to Template | 1. Open Exercise Selector<br>2. Tap on any exercise | - Exercise added to template<br>- Modal closes automatically<br>- Exercise appears in exercises list with details<br>- Exercise shows index number, name, muscle group, equipment |
| CREATE-06 | Add Multiple Exercises | 1. Tap "+ Add Exercise" button<br>2. Select first exercise<br>3. Repeat to add 3-5 more exercises | - Each exercise added in order<br>- Index numbers increment (1, 2, 3, etc.)<br>- All exercises visible in the list |
| CREATE-07 | Attempt to Save Without Name | 1. Create template<br>2. Add exercises<br>3. Leave template name empty<br>4. Tap "Save" button | - Alert displayed: "Template name is required"<br>- Template not saved<br>- Remain on editor screen |
| CREATE-08 | Attempt to Save Without Exercises | 1. Create template<br>2. Enter template name<br>3. Don't add any exercises<br>4. Tap "Save" button | - Alert displayed: "At least one exercise is required"<br>- Template not saved<br>- Remain on editor screen |
| CREATE-09 | Successfully Create Template | 1. Enter template name "My Chest Day"<br>2. Enter description "Custom chest workout"<br>3. Add 3-4 exercises<br>4. Tap "Save" button | - Success alert: "Template created successfully"<br>- Navigate back to Templates screen<br>- New template appears in "My Templates" section<br>- Template shows correct name, description, exercise count |
| CREATE-10 | Cancel Template Creation | 1. Start creating template<br>2. Enter some data<br>3. Tap "Back" button | - Warning alert: "You have unsaved changes. Discard?"<br>- Options: Cancel, Discard<br>- If Discard: return to Templates screen without saving<br>- If Cancel: remain on editor |

---

### 3. EDITING TEMPLATES

| Test Case ID | Test Case Description | Steps to Reproduce | Expected Result |
|--------------|----------------------|-------------------|-----------------|
| EDIT-01 | Open Edit Template Screen | 1. Navigate to Templates screen<br>2. On a user template, tap Edit button (pencil icon) | - Navigate to Template Editor<br>- Title shows "Edit Template"<br>- Form pre-filled with template name, description<br>- Existing exercises displayed in list |
| EDIT-02 | Modify Template Name | 1. Open template in edit mode<br>2. Change template name<br>3. Tap "Save" | - Success alert: "Template updated successfully"<br>- Return to Templates screen<br>- Template shows updated name |
| EDIT-03 | Modify Template Description | 1. Open template in edit mode<br>2. Change description<br>3. Tap "Save" | - Success alert shown<br>- Template description updated in display |
| EDIT-04 | Add Exercise to Existing Template | 1. Open template in edit mode<br>2. Tap "+ Add Exercise"<br>3. Select new exercise<br>4. Tap "Save" | - New exercise added to list<br>- Template saved successfully<br>- Updated exercise count visible |
| EDIT-05 | Remove Exercise from Template | 1. Open template in edit mode<br>2. Tap delete button (trash icon) on an exercise<br>3. Confirm deletion<br>4. Tap "Save" | - Confirmation alert: "Remove exercise?"<br>- Exercise removed from list<br>- Template saved with updated exercises |
| EDIT-06 | Cancel Edit Without Changes | 1. Open template in edit mode<br>2. Don't modify anything<br>3. Tap "Back" | - Return to Templates screen immediately (no warning)<br>- Template unchanged |
| EDIT-07 | Cancel Edit With Changes | 1. Open template in edit mode<br>2. Make changes<br>3. Tap "Back" | - Warning alert displayed<br>- Can discard or cancel<br>- Changes not saved if discarded |

---

### 4. COPYING TEMPLATES

| Test Case ID | Test Case Description | Steps to Reproduce | Expected Result |
|--------------|----------------------|-------------------|-----------------|
| COPY-01 | Copy Preset Template via Alert | 1. Navigate to Templates screen<br>2. Tap on a preset template card | - Alert displayed: "Copy this template?"<br>- Message includes template name<br>- Options: Cancel, Confirm |
| COPY-02 | Confirm Copy Preset Template | 1. Tap preset template<br>2. Tap "Confirm" in alert | - Navigate to Template Editor<br>- Title shows "Copy Template"<br>- Form pre-filled with template name + " (Copy)"<br>- All exercises from preset loaded |
| COPY-03 | Cancel Copy Preset Template | 1. Tap preset template<br>2. Tap "Cancel" in alert | - Remain on Templates screen<br>- No navigation occurs |
| COPY-04 | Save Copied Template | 1. Copy a preset template<br>2. Optionally modify name/exercises<br>3. Tap "Save" | - Success alert displayed<br>- New template created in "My Templates"<br>- Original preset unchanged |
| COPY-05 | Copy via Copy Badge Button | 1. In preset template section<br>2. Tap "Copy Template" button on preset card | - Same behavior as COPY-01<br>- Alert and confirmation flow |

---

### 5. DELETING TEMPLATES

| Test Case ID | Test Case Description | Steps to Reproduce | Expected Result |
|--------------|----------------------|-------------------|-----------------|
| DELETE-01 | Delete User Template | 1. Navigate to Templates screen<br>2. On user template, tap Delete button (trash icon) | - Confirmation alert: "Delete this template?"<br>- Message includes template name<br>- Options: Cancel, Confirm<br>- Confirm button styled as destructive (red) |
| DELETE-02 | Confirm Template Deletion | 1. Tap Delete button<br>2. Tap "Confirm" | - Success alert: "Template deleted successfully"<br>- Template removed from "My Templates" list<br>- List updates immediately |
| DELETE-03 | Cancel Template Deletion | 1. Tap Delete button<br>2. Tap "Cancel" | - Remain on Templates screen<br>- Template not deleted<br>- Template still visible in list |
| DELETE-04 | Verify Preset Templates Cannot Be Deleted | 1. View preset template cards | - No delete button visible on preset templates<br>- Only edit/delete available for user templates |

---

### 6. EDGE CASES & VALIDATION

| Test Case ID | Test Case Description | Steps to Reproduce | Expected Result |
|--------------|----------------------|-------------------|-----------------|
| EDGE-01 | Empty Template Name Field | 1. Create template<br>2. Focus on name field, then clear it<br>3. Try to save | - Validation alert shown<br>- Required field indicator visible (red asterisk) |
| EDGE-02 | Very Long Template Name | 1. Create template<br>2. Enter name with 100+ characters<br>3. Save template | - Template saves successfully<br>- Name displays correctly (may truncate in list view) |
| EDGE-03 | Template Description Optional | 1. Create template<br>2. Enter name<br>3. Leave description empty<br>4. Add exercises and save | - Template saves successfully<br>- No description shown in template card |
| EDGE-04 | Remove All Exercises | 1. Edit template with exercises<br>2. Remove all exercises<br>3. Try to save | - Validation alert: "At least one exercise is required"<br>- Cannot save with zero exercises |
| EDGE-05 | Exercise Selector - No Results | 1. Open Exercise Selector<br>2. Search for non-existent exercise (e.g., "zzzzz") | - Empty state displayed<br>- Message: "No exercises found" |
| EDGE-06 | Multiple Templates with Same Name | 1. Create template "Test"<br>2. Create another template "Test" | - Both templates created successfully<br>- Identified by unique IDs<br>- Both visible in list |
| EDGE-07 | Rapid Tap on Save Button | 1. Create valid template<br>2. Rapidly tap "Save" multiple times | - Only one save operation occurs<br>- Button disabled during save<br>- Loading indicator shown |
| EDGE-08 | Exercise Selector Search Special Characters | 1. Open Exercise Selector<br>2. Search with special characters (@#$%) | - No errors occur<br>- Shows empty results gracefully |

---

### 7. INTEGRATION & NAVIGATION

| Test Case ID | Test Case Description | Steps to Reproduce | Expected Result |
|--------------|----------------------|-------------------|-----------------|
| NAV-01 | Navigate from Templates to Editor | 1. Tap "Create New" button | - Successfully navigate to editor<br>- Back button functional<br>- Screen title correct |
| NAV-02 | Navigate Back from Editor | 1. In Template Editor<br>2. Tap "Back" button | - Return to Templates screen<br>- Templates list visible |
| NAV-03 | Navigate to WorkoutLobby | 1. Tap any template card (not action buttons) | - Navigate to WorkoutLobby screen<br>- Template data passed correctly<br>- Can navigate back to Templates |
| NAV-04 | Modal Exercise Selector | 1. Open Exercise Selector modal<br>2. Tap outside modal or close button | - Modal closes<br>- Return to Template Editor<br>- No exercises added if none selected |
| NAV-05 | Deep Link Navigation | 1. From another screen, navigate to Templates tab | - Templates screen loads correctly<br>- Data loads on first view |
| NAV-06 | Tab Navigation Persistence | 1. Navigate away from Templates tab<br>2. Return to Templates tab | - Screen state preserved (scroll position)<br>- Templates still visible |

---

### 8. LOADING & ERROR STATES

| Test Case ID | Test Case Description | Steps to Reproduce | Expected Result |
|--------------|----------------------|-------------------|-----------------|
| LOAD-01 | Initial Load State | 1. First time opening Templates screen | - Loading indicator displayed briefly<br>- Templates load and display<br>- No errors shown |
| LOAD-02 | Pull to Refresh Loading | 1. Pull down on Templates screen | - Refresh indicator appears<br>- Indicator disappears when complete<br>- Templates updated |
| LOAD-03 | Exercise Selector Load | 1. Open Exercise Selector for first time | - Loading state while exercises load<br>- Exercise list appears<br>- Count displayed in footer |
| LOAD-04 | Save Operation Loading | 1. Create template<br>2. Tap Save | - Save button shows loading indicator<br>- Button disabled during save<br>- Success feedback shown when complete |

---

## Test Execution Summary Template

After running all tests, document results in the following format:

```
Test Category: [Category Name]
Total Tests: [X]
Passed: [X]
Failed: [X]
Blocked: [X]

Failed Test Details:
- Test ID: [ID]
- Issue: [Description]
- Severity: [Critical/High/Medium/Low]
- Steps to Reproduce: [Detailed steps]
- Actual Result: [What actually happened]
- Environment: [Device/OS/App version]
```

---

## Pre-Testing Checklist

- [ ] App builds and runs without errors
- [ ] Navigation to Templates screen works
- [ ] No linter errors in templates feature code
- [ ] AsyncStorage is functional for data persistence
- [ ] All translation keys exist (en.json, zh.json)
- [ ] Preset templates data loads correctly
- [ ] Exercise library data loads correctly (70+ exercises)

---

## Post-Testing Actions

1. **Document Results**
   - Fill out Test Execution Summary for each category
   - Document all bugs found with screenshots
   - Note any performance issues

2. **Update Documentation**
   - Update TEMPLATES_FEATURE_SUMMARY.md with test results
   - Create bug report document if issues found
   - Update test cases if new edge cases discovered

3. **Create Unit Tests**
   - Write unit tests for critical service functions
   - Test templateService CRUD operations
   - Test exerciseLibraryService functions
   - Test hook state management

4. **Integration Tests**
   - Consider E2E tests for complex workflows
   - Test navigation flows
   - Test data persistence across app restarts

5. **Code Review**
   - Review any code changes made during testing
   - Verify error handling is comprehensive
   - Check for code optimization opportunities

---

## Known Limitations & Future Enhancements

### Current Limitations
- No drag-to-reorder exercises functionality
- No search/filter on Templates screen (only exercise selector)
- No template categories/tags
- No template export/import

### Planned Enhancements
- Exercise reordering via drag-and-drop
- Advanced filtering by category/difficulty on main screen
- Template sharing functionality
- Custom exercise creation
- Exercise video instructions
- Template usage statistics

---

## Test Execution History

### Iteration 1 (Pending)
**Date:** _____________  
**Tester:** _____________  
**Environment:** _____________  
**Results:** _____________  

---

## Appendix A: Translation Keys Required

The following i18n keys should exist for proper testing:

**Common:**
- `common.error`
- `common.success`
- `common.loading`
- `common.cancel`
- `common.confirm`
- `common.save`
- `common.back`
- `common.discard`

**Templates:**
- `templates.title`
- `templates.createNew`
- `templates.myTemplates`
- `templates.explorePresets`
- `templates.preset`
- `templates.exercises`
- `templates.estimatedTime`
- `templates.noUserTemplates`
- `templates.noPresetTemplates`
- `templates.copyTemplate`
- `templates.copyTemplateMessage`
- `templates.deleteTemplate`
- `templates.deleteTemplateMessage`
- `templates.templateDeleted`
- `templates.searchExercises`
- `templates.noExercisesFound`
- `templates.noExercisesAvailable`
- `templates.exercisesAvailable`

**Template Editor:**
- `templateEditor.createTemplate`
- `templateEditor.editTemplate`
- `templateEditor.copyTemplate`
- `templateEditor.templateName`
- `templateEditor.enterTemplateName`
- `templateEditor.templateDescription`
- `templateEditor.enterTemplateDescription`
- `templateEditor.exercises`
- `templateEditor.addExercise`
- `templateEditor.noExercises`
- `templateEditor.addExerciseHint`
- `templateEditor.removeExercise`
- `templateEditor.removeExerciseMessage`
- `templateEditor.nameRequired`
- `templateEditor.exercisesRequired`
- `templateEditor.templateCreated`
- `templateEditor.templateUpdated`
- `templateEditor.saveFailed`
- `templateEditor.unsavedChanges`
- `templateEditor.unsavedChangesMessage`
- `templateEditor.sets`
- `templateEditor.reps`
- `templateEditor.weight`

---

## Appendix B: Test Data Samples

### Sample Template Data
```javascript
{
  id: 'user_1234567890',
  name: 'Test Template',
  description: 'Testing template creation',
  exercises: [
    {
      id: 'exercise-1',
      exercise: 'Barbell Bench Press',
      muscleGroup: 'Chest',
      movementPattern: 'Horizontal Press',
      equipment: 'Barbell',
      tags: ['compound', 'push']
    }
  ],
  category: 'Custom',
  difficulty: 'Intermediate',
  estimatedTime: 60,
  createdAt: '2025-10-28T00:00:00Z',
  updatedAt: '2025-10-28T00:00:00Z'
}
```

### Sample Exercise Data
```javascript
{
  id: 'ex_chest_1',
  name: 'Barbell Bench Press',
  muscle_group: 'Chest',
  movement_pattern: 'Horizontal Press',
  equipment: 'Barbell',
  tags: ['compound', 'push']
}
```

---

**End of Test Plan**

**Document Version:** 1.0  
**Last Updated:** October 28, 2025  
**Next Review Date:** After manual testing completion

