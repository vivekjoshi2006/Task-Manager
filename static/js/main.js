document.addEventListener('DOMContentLoaded', () => {
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const tasksContainer = document.getElementById('tasks-container');

    // --- Backend API Communication Functions ---

    async function fetchTasks() {
        try {
            const response = await fetch('/api/tasks'); 
            if (!response.ok) { 
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json(); 
        } catch (error) {
            console.error('Error fetching tasks:', error);
            tasksContainer.innerHTML = '<p class="no-tasks-message error">Could not load tasks. Please try refreshing.</p>';
            return [];
        }
    }


    async function addTaskToBackend(name) {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }) // Convert our task name to JSON format
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to add task: ${errorData.error || response.statusText}`);
            }
            return await response.json(); 
        } catch (error) {
            console.error('Error adding task:', error);
            alert(`Failed to add task: ${error.message}`);
            return null;
        }
    }


    async function updateTaskInBackend(taskId, updates) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',          // We're updating existing data
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to update task: ${errorData.error || response.statusText}`);
            }

            // Backend typically just confirms success for PUT, no new data needed

        } catch (error) {
            console.error('Error updating task:', error);
            alert(`Failed to update task: ${error.message}`);
        }
    }


    async function deleteTaskFromBackend(taskId) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE' // We're deleting data
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to delete task: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert(`Failed to delete task: ${error.message}`);
        }
    }


    // ------------------------------------- UI Rendering Logic --------------------------------


    function renderTasks(tasks) {
        tasksContainer.innerHTML = ''; // Clear out any old tasks or messages first

        if (tasks.length === 0) {

            // If there are no tasks, show a friendly message

            tasksContainer.innerHTML = '<p class="no-tasks-message">No notes yet! Add one above.</p>';
            return;
        }

        // Loop through each task and create its HTML representation

        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            taskItem.dataset.taskId = task.id; // Store the task's ID directly on the HTML element

            // If the task is completed, add a special class for styling (e.g., strikethrough)

            if (task.completed) {
                taskItem.classList.add('completed');
            }

            // Construct the HTML for a single task card

            taskItem.innerHTML = `
                <div class="task-header">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text" contenteditable="true" role="textbox" aria-label="Edit task">${task.name}</span>
                    <button class="delete-btn" aria-label="Delete note">&#x2715;</button>
                </div>
            `;
            tasksContainer.appendChild(taskItem); // Add the new task card to our container
        });


        // After all tasks are rendered, attach all the interactive event listeners

        setupTaskInteractions();
    }


    // ----------------------------- Event Listener Setup --------------------------------

    function setupTaskInteractions() {

        // --- Hover to Show Delete Button ---

        tasksContainer.querySelectorAll('.task-item').forEach(item => {
            const deleteBtn = item.querySelector('.delete-btn');
            if (deleteBtn) {                // Ensure button exists before adding listeners
                item.addEventListener('mouseenter', () => {
                    deleteBtn.style.display = 'flex';       // Show the button (using flex to center 'X')
                });
                item.addEventListener('mouseleave', () => {
                    deleteBtn.style.display = 'none'; // Hide it again
                });
            }
        });

        
        // -------------------------------- Checkbox Toggle Completion -----------------------------

        tasksContainer.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', async (event) => {
                const taskItem = event.target.closest('.task-item'); // Find the parent task card
                const taskId = taskItem.dataset.taskId; // Get the ID from the card
                const isCompleted = event.target.checked; // Check if the box is now checked

                taskItem.classList.toggle('completed', isCompleted); // Update visual class
                await updateTaskInBackend(taskId, { completed: isCompleted }); // Send update to backend

                // Re-fetch and re-render tasks to apply sorting (completed tasks at bottom)

                await loadAndRenderTasks();
            });
        });


        // ------------------------ In-place Editing of Task Text -----------------------------------------

        tasksContainer.querySelectorAll('.task-text').forEach(textSpan => {
            let originalText = textSpan.textContent.trim(); // Store original text on focus

            textSpan.addEventListener('focus', () => {
                originalText = textSpan.textContent.trim(); // Capture current state on focus
            });


            textSpan.addEventListener('blur', async (event) => {
                const taskItem = event.target.closest('.task-item');
                const taskId = taskItem.dataset.taskId;
                const newName = textSpan.textContent.trim(); // Get the new, trimmed text

                if (newName !== originalText && newName !== '') {

                    // If text actually changed and is not empty, update backend

                    await updateTaskInBackend(taskId, { name: newName });

                    // No need to re-render all tasks, just this one visually

                } else if (newName === '') {

                    // If the user cleared the text, revert it or prompt for deletion

                    textSpan.textContent = originalText; // Revert visually
                    alert('Note cannot be empty. Reverted to original text.');
                }
            });


            // Handle 'Enter' key during editing: save and unfocus

            textSpan.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Stop 'Enter' from creating a new line
                    textSpan.blur(); // Trigger the 'blur' event to save changes
                }
            });
        });


        // -------------------------------------- Delete Task Button ---------------------------------

        tasksContainer.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const taskItem = event.target.closest('.task-item');
                const taskId = taskItem.dataset.taskId;

                if (confirm('Are you sure you want to delete this note?')) {
                    await deleteTaskFromBackend(taskId); // Send delete request
                    taskItem.remove(); // Remove the task card from the UI immediately
                    await loadAndRenderTasks(); // Re-render to update "No notes" message if needed
                }
            });
        });
    }


    // -------------------------- Initial Load & New Task Addition ------------------------

    async function loadAndRenderTasks() {
        const tasks = await fetchTasks();
        renderTasks(tasks);
    }


    // Event listener for the "Add Note" button

    addTaskBtn.addEventListener('click', async () => {
        const taskName = newTaskInput.value.trim(); // Get and clean the input text
        if (taskName) {
            const newTask = await addTaskToBackend(taskName); 
            if (newTask) { // Only clear and refresh if add was successful
                newTaskInput.value = ''; // Clear the input field
                await loadAndRenderTasks(); // Refresh the entire list
            }
        } else {
            alert('Please type a note before adding.'); // Prompt user for input
        }
    });


    // Allow adding a task by pressing 'Enter' in the input field

    newTaskInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission behavior
            
            // Trigger the same logic as clicking the Add Note button
            addTaskBtn.click();
        }
    });


    // ---------------------------------------- Run on Page Load ------------------------------------

    loadAndRenderTasks();
});