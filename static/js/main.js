document.addEventListener('DOMContentLoaded', () => {
    const noteTitleInput = document.getElementById('new-task-title');
    const pinToggleBtn = document.getElementById('pin-toggle-btn');
    const noteContentInput = document.getElementById('new-task-content');
    const toggleChecklistBtn = document.getElementById('toggle-checklist-btn');
    const checklistContainer = document.getElementById('new-task-checklist-container');
    const checklistItemsList = document.getElementById('checklist-items-input-list');
    const addChecklistRowBtn = document.getElementById('add-checklist-item-input-btn');
    const noteLabelInput = document.getElementById('new-task-label');
    const addNoteBtn = document.getElementById('add-task-btn');
    
    // Notes Grid Container
    const tasksContainer = document.getElementById('tasks-container');

    // Global states inside note creation panel
    let isPinnedState = false;


    // Toggle Pin state in editor panel

    pinToggleBtn.addEventListener('click', () => {
        isPinnedState = !isPinnedState;
        pinToggleBtn.classList.toggle('active', isPinnedState);
    });

    
    // Toggle checklist builder state in editor panel

    toggleChecklistBtn.addEventListener('click', () => {
        const isChecklistVisible = checklistContainer.style.display !== 'none';
        if (isChecklistVisible) {

            // Revert back to plain-text mode

            checklistContainer.style.display = 'none';
            noteContentInput.style.display = 'block';
            toggleChecklistBtn.textContent = '☑ Checklist';
        } else {

            // Toggle checklist mode on

            noteContentInput.style.display = 'none';
            checklistContainer.style.display = 'block';
            toggleChecklistBtn.textContent = '📝 Text Note';

            // Start checklist with an initial empty line row

            if (checklistItemsList.children.length === 0) {
                appendNewChecklistRow();
            }
        }
    });


    // Helper to generate input line elements inside note creation list

    function appendNewChecklistRow(value = "") {
        const row = document.createElement('div');
        row.className = 'creation-checklist-row';
        row.innerHTML = `
            <input type="checkbox" disabled>
            <input type="text" class="creation-item-text" placeholder="List item" value="${escapeHTML(value)}" autocomplete="off">
            <button class="remove-creation-item-btn" type="button">&times;</button>
        `;

        const textInput = row.querySelector('.creation-item-text');
        const removeBtn = row.querySelector('.remove-creation-item-btn');

        removeBtn.addEventListener('click', () => {
            row.remove();
            if (checklistItemsList.children.length === 0) {
                appendNewChecklistRow();
            }
        });

        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const nextRow = appendNewChecklistRow();
                row.after(nextRow);
                nextRow.querySelector('.creation-item-text').focus();
            }
        });

        checklistItemsList.appendChild(row);
        return row;
    }

    addChecklistRowBtn.addEventListener('click', () => {
        const row = appendNewChecklistRow();
        row.querySelector('.creation-item-text').focus();
    });


    // Fetch notes from server and render grid

    async function fetchNotes() {
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) throw new Error('Failed to load notes');
            const notes = await response.json();
            renderNotes(notes);
        } catch (error) {
            console.error('Error fetching notes:', error);
            tasksContainer.innerHTML = '<p class="no-tasks-message">Error connecting to server.</p>';
        }
    }


    // Main Renderer

function renderNotes(notes) {
    tasksContainer.innerHTML = '';

    if (notes.length === 0) {
        tasksContainer.innerHTML = '<p class="no-tasks-message">No notes yet. Add one above!</p>';
        return;
    }

    notes.forEach(note => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item`;
        taskItem.dataset.id = note.id;


        // Generate card header

        let cardHeaderHTML = `
            <div class="card-title-row">
                <h3 class="note-title" contenteditable="true" data-field="title">${escapeHTML(note.title || '')}</h3>
                <button class="card-pin-btn ${note.pinned ? 'active' : ''}" title="Pin Note">${note.pinned ? 'Pin' : 'Pin'}</button>
            </div>
        `;

        
        // Generate card body based on is_checklist boolean

        let cardBodyHTML = '';
        if (note.is_checklist) {
            cardBodyHTML += `<div class="note-checklist-container">`;
            note.checklist_items.forEach((item, index) => {
                cardBodyHTML += `
                    <div class="note-checklist-row ${item.completed ? 'completed-row' : ''}" data-index="${index}">
                        <input type="checkbox" class="note-item-checkbox" ${item.completed ? 'checked' : ''}>
                        <span class="note-item-text" contenteditable="true">${escapeHTML(item.text)}</span>
                        <button class="remove-note-item-btn" type="button">&times;</button>
                    </div>
                `;
            });

        
            // Append quick add inline-row inside list note card

            cardBodyHTML += `
                <div class="card-add-item-row">
                    <span>+</span>
                    <input type="text" class="card-add-item-input" placeholder="Add item..." autocomplete="off">
                </div>
            `;
            cardBodyHTML += `</div>`;
        } else {
            cardBodyHTML += `
                <div class="note-text-body" contenteditable="true" data-field="content">${escapeHTML(note.content || '')}</div>
            `;
        }


        // Generate card footer containing Tag and Menu trigger dropdown option list

        const footerHTML = `
            <div class="note-footer">
                ${note.label ? `<span class="note-label-badge" title="${escapeHTML(note.label)}">${escapeHTML(note.label)}</span>` : ''}
                <div class="note-actions">
                    <button class="menu-trigger-btn">⋮</button>
                    <div class="card-menu-dropdown">
                        <button class="menu-item delete-note-item">Delete note</button>
                        <button class="menu-item edit-label-item">${note.label ? 'Change label' : 'Add label'}</button>
                        ${note.label ? `<button class="menu-item delete-label-item">Delete label</button>` : ''}
                        <button class="menu-item toggle-checkboxes-item">${note.is_checklist ? 'Hide checkboxes' : 'Show checkboxes'}</button>
                    </div>
                </div>
            </div>
        `;

        taskItem.innerHTML = cardHeaderHTML + `<div class="note-content">${cardBodyHTML}</div>` + footerHTML;

        // Setup card interactions

        setupNoteCardEvents(taskItem, note);
        tasksContainer.appendChild(taskItem);
    });
}


    function setupNoteCardEvents(card, note) {
        const titleEl = card.querySelector('.note-title');
        const pinBtn = card.querySelector('.card-pin-btn');
        const menuTrigger = card.querySelector('.menu-trigger-btn');
        const dropdownMenu = card.querySelector('.card-menu-dropdown');
        

        // Context menu items

        const deleteBtn = card.querySelector('.delete-note-item');
        const editLabelBtn = card.querySelector('.edit-label-item');
        const toggleCheckboxesBtn = card.querySelector('.toggle-checkboxes-item');
        const deleteLabelBtn = card.querySelector('.delete-label-item');


        // Toggle Pinned Status

        pinBtn.addEventListener('click', async () => {
            await updateNote(note.id, { pinned: !note.pinned });
            fetchNotes();
        });


        // Save modified Title on blur

        titleEl.addEventListener('blur', async () => {
            const updatedTitle = titleEl.innerText.trim();
            if (updatedTitle !== note.title) {
                await updateNote(note.id, { title: updatedTitle });
            }
        });

        titleEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                titleEl.blur();
            }
        });


        // Toggle Three-Dot Dropdown Panel

        menuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();

            // Close all other dropdown menus

            document.querySelectorAll('.card-menu-dropdown').forEach(menu => {
                if (menu !== dropdownMenu) menu.classList.remove('show');
            });
            dropdownMenu.classList.toggle('show');
        });


        // Delete Card

        deleteBtn.addEventListener('click', async () => {
            await deleteNote(note.id);
        });


        // Set Label on note card

        editLabelBtn.addEventListener('click', async () => {
            dropdownMenu.classList.remove('show');
            const newLabel = prompt("Enter label name:", note.label || "");
            if (newLabel !== null) {
                await updateNote(note.id, { label: newLabel.trim() });
                fetchNotes();
            }
        });


        // ---> Handle clearing the label <---
        
        if (deleteLabelBtn) {
            deleteLabelBtn.addEventListener('click', async () => {
                dropdownMenu.classList.remove('show');
                await updateNote(note.id, { label: "" });
                fetchNotes();
            });
        }


        // Toggle checklists on note card ("Show Checkboxes" or "Hide Checkboxes" conversion logic)

        toggleCheckboxesBtn.addEventListener('click', async () => {
            dropdownMenu.classList.remove('show');
            if (note.is_checklist) {

                // Convert list items back to multi-line plain text note

                const textContent = note.checklist_items.map(item => item.text).join('\n');
                await updateNote(note.id, {
                    is_checklist: false,
                    content: textContent,
                    checklist_items: []
                });
            } else {

                // Convert plain text split by newline into checklist objects

                const rawText = note.content || '';
                const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                const listItems = lines.map(line => ({
                    id: Math.random().toString(36).substring(2, 9),
                    text: line,
                    completed: false
                }));


                // Fallback inside checklist if empty

                if (listItems.length === 0) {
                    listItems.push({ id: Math.random().toString(36).substring(2, 9), text: "List item", completed: false });
                }
                await updateNote(note.id, {
                    is_checklist: true,
                    content: "",
                    checklist_items: listItems
                });
            }
            fetchNotes();
        });

        
        // Handle Checklist/Text body interactions inside active rendering Note Cards

        if (note.is_checklist) {
            const listRows = card.querySelectorAll('.note-checklist-row');
            const inlineAdderInput = card.querySelector('.card-add-item-input');

            listRows.forEach(row => {
                const idx = parseInt(row.dataset.index);
                const checkbox = row.querySelector('.note-item-checkbox');
                const textSpan = row.querySelector('.note-item-text');
                const removeBtn = row.querySelector('.remove-note-item-btn');


                // Toggle sub-item checkbox completion status

                checkbox.addEventListener('change', async () => {
                    note.checklist_items[idx].completed = checkbox.checked;
                    await updateNote(note.id, { checklist_items: note.checklist_items });
                    fetchNotes();
                });


                // Edit sub-item text line directly

                textSpan.addEventListener('blur', async () => {
                    const updatedText = textSpan.innerText.trim();
                    if (updatedText && updatedText !== note.checklist_items[idx].text) {
                        note.checklist_items[idx].text = updatedText;
                        await updateNote(note.id, { checklist_items: note.checklist_items });
                    } else if (!updatedText) {
                        textSpan.innerText = note.checklist_items[idx].text;
                    }
                });

                textSpan.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        textSpan.blur();
                    }
                });


                // Remove list item from list note card

                removeBtn.addEventListener('click', async () => {
                    note.checklist_items.splice(idx, 1);
                    await updateNote(note.id, { checklist_items: note.checklist_items });
                    fetchNotes();
                });
            });


            // Inline item adding from note card

            inlineAdderInput.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    const newItemVal = inlineAdderInput.value.trim();
                    if (newItemVal) {
                        note.checklist_items.push({
                            id: Math.random().toString(36).substring(2, 9),
                            text: newItemVal,
                            completed: false
                        });
                        await updateNote(note.id, { checklist_items: note.checklist_items });
                        fetchNotes();
                    }
                }
            });
        } else {


            // Edit plain-text content

            const textBodyEl = card.querySelector('.note-text-body');
            textBodyEl.addEventListener('blur', async () => {
                const updatedContent = textBodyEl.innerText.trim();
                if (updatedContent !== note.content) {
                    await updateNote(note.id, { content: updatedContent });
                }
            });
        }
    }


    // API Call wrappers

    async function addNote() {
        const title = noteTitleInput.value.trim();
        const label = noteLabelInput.value.trim();
        const isChecklist = checklistContainer.style.display !== 'none';
        
        let content = "";
        let checklist_items = [];

        if (isChecklist) {
            const rows = checklistContainer.querySelectorAll('.creation-checklist-row');
            rows.forEach(row => {
                const val = row.querySelector('.creation-item-text').value.trim();
                if (val) {
                    checklist_items.push({
                        id: Math.random().toString(36).substring(2, 9),
                        text: val,
                        completed: false
                    });
                }
            });
        } else {
            content = noteContentInput.value;
        }

        if (!title && !content && checklist_items.length === 0 && !label) return;

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    is_checklist: isChecklist,
                    checklist_items,
                    label,
                    pinned: isPinnedState
                })
            });

            if (response.ok) {

                // Reset creation states on success

                noteTitleInput.value = '';
                noteContentInput.value = '';
                noteLabelInput.value = '';
                checklistItemsList.innerHTML = '';
                isPinnedState = false;
                pinToggleBtn.classList.remove('active');           

                // Revert visual to text editor default

                checklistContainer.style.display = 'none';
                noteContentInput.style.display = 'block';
                toggleChecklistBtn.textContent = '☑ Checklist';

                fetchNotes();
            }
        } catch (error) {
            console.error('Error adding note:', error);
        }
    }

    async function updateNote(id, data) {
        try {
            await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('Error updating note:', error);
        }
    }

    async function deleteNote(id) {
        try {
            const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchNotes();
            }
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    }


    // Dismiss active card menus on general screen click

    document.addEventListener('click', () => {
        document.querySelectorAll('.card-menu-dropdown').forEach(menu => {
            menu.classList.remove('show');
        });
    });


    // Sanitization Utility

    function escapeHTML(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    addNoteBtn.addEventListener('click', addNote);
    fetchNotes();
});
