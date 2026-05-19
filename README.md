
#  Task Manager (Flask & Frontend)

## 🚀 Project Explanation

This project is a web-based task manager designed to mimic the aesthetic and core functionality of Google Keep. It allows users to:

*   **Add New Notes:** Easily create new tasks or notes via a dedicated input field.
*   **Mark as Complete:** Toggle the completion status of a note using a prominent green checkbox.
*   **Edit In-Place:** Directly click and edit the text of any note, saving changes automatically on blur or pressing Enter.
*   **Delete Notes:** A bold red 'X' button appears when hovering over a note card, allowing for easy deletion.
*   **Persistent Storage:** All notes are saved to a local JSON file on the server, ensuring your data is retained even after closing and restarting the application.
*   **Attractive UI:** Features a modern **Glassmorphism** design with a sky-blue theme, vibrant colors, and smooth interactions, providing a delightful user experience.

The application is structured as a full-stack web project, with a Python Flask backend handling data management and a modern HTML, CSS, and JavaScript frontend delivering the interactive user interface.

## 🛠️ Tech Stack Used

This project leverages a popular and robust combination of technologies:

*   **Backend:**
    *   **Python 3.x:** The core programming language.
    *   **Flask:** A lightweight and powerful Python web framework used for:
        *   Serving the web pages (`index.html`).
        *   Providing a RESTful API to manage tasks (create, read, update, delete).
        *   Handling persistent storage of tasks in a JSON file.
    *   **JSON (JavaScript Object Notation):** Used as a simple, human-readable format for storing task data on the server's filesystem (`data/tasks.json`).

*   **Frontend:**
    *   **HTML5:** The standard markup language for creating the structure and content of the web pages.
    *   **CSS3:** Used for styling the application, including:
        *   A modern **Glassmorphism** design with transparency and background blur effects.
        *   A cool **Sky Blue theme** with vibrant accents.
        *   Responsive design for optimal viewing on various devices (desktops, tablets, mobile).
        *   Custom styling for checkboxes, hover effects, and a colorful heading.
    *   **JavaScript (ES6+):** Provides the interactivity and dynamic behavior on the client-side:
        *   Communicates with the Flask API to fetch, add, update, and delete tasks asynchronously.
        *   Dynamically renders and updates the task list in the browser.
        *   Handles all user interactions like checkbox clicks, in-place editing, and delete button hovers/clicks.

## 🚀 How to Run the Project

Follow these steps to get the Task Manager up and running on your local machine:

### 1. **Clone the Repository**

First, clone this project to your local machine using Git:

```bash
git clone https://github.com/vivekjoshi2006/Task-Manager.git
cd Task Manager  # Navigate into the project directory
```

### 2. **Set Up a Python Virtual Environment (Recommended)**

It's highly recommended to use a virtual environment to manage project dependencies. This isolates the project's packages from your system's global Python packages.

```bash
# Create a virtual environment named 'venv'
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate
```

### 3. **Install Dependencies**

With your virtual environment activated, install the required Python packages (Flask) using `pip`:

```bash
pip install -r requirements.txt
```

### 4. **Initialize Task Data File**

The project stores tasks in `data/tasks.json`. Ensure this file exists. If it's a fresh setup, you can create an empty JSON array:

```json
# data/tasks.json
[]
```
*(The Flask app will create the `data/` directory and handle empty `tasks.json` if it's missing or empty, but explicitly creating it is good practice.)*

### 5. **Run the Flask Application**

Once dependencies are installed, you can start the Flask development server:

```bash
# Ensure your virtual environment is still activated
python app.py
```

You should see output similar to this:

```
 * Debug mode: on
 * Running on http://127.0.0.1:5000 (Press CTRL+C to quit)
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: XXX-XXX-XXX
```

### 6. **Access the Application**

Open your web browser and navigate to the address provided by Flask, typically:

[http://127.0.0.1:5000/](http://127.0.0.1:5000/)

You can now interact with Keep-style Task Manager! Changes to notes will be saved automatically to `data/tasks.json`.

---
```
