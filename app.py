from flask import Flask, render_template, request, jsonify
import json
import os
import uuid

app = Flask(__name__) 
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
TASKS_FILE_PATH = os.path.join(DATA_DIR, "tasks.json")

os.makedirs(DATA_DIR, exist_ok=True)

def load_tasks_from_file():
    if not os.path.exists(TASKS_FILE_PATH) or os.path.getsize(TASKS_FILE_PATH) == 0:
        return []           # No tasks yet, return an empty list

    try:
        with open(TASKS_FILE_PATH, "r", encoding="utf-8") as file:
            tasks = json.load(file)

            # Let's ensure consistency: every task should have an ID and a completion status

            for task in tasks:
                if 'id' not in task:
                    task['id'] = str(uuid.uuid4()) # Assign a fresh ID if missing
                if 'completed' not in task:
                    task['completed'] = False
            return tasks
    except json.JSONDecodeError:

        # If the JSON file is broken, we'll log it and start fresh to prevent crashes

        print(f"Warning: '{TASKS_FILE_PATH}' is corrupted. Starting with empty tasks.")
        return []
    

def save_tasks_to_file(tasks_list):
    with open(TASKS_FILE_PATH, "w", encoding="utf-8") as file:
        json.dump(tasks_list, file, indent=4) # 'indent=4' makes the JSON file human-readable


@app.route("/")
def render_main_page():
    return render_template("index.html")

@app.route("/api/tasks", methods=["GET"])
def get_all_tasks_api():
    tasks = load_tasks_from_file()

    # Sort them: incomplete tasks (False) come before complete tasks (True)

    sorted_tasks = sorted(tasks, key=lambda t: t['completed'])
    return jsonify(sorted_tasks) # Send the tasks back as JSON


@app.route("/api/tasks", methods=["POST"])
def add_new_task_api():
    task_data = request.get_json() 
    task_name = task_data.get("name")

    if not task_name or not task_name.strip(): 
        return jsonify({"error": "Task name cannot be empty."}), 400


    tasks = load_tasks_from_file()
    new_task = {
        "id": str(uuid.uuid4()), # Give it a fresh, unique ID
        "name": task_name.strip(), # Clean up any extra spaces
        "completed": False # New tasks are always not completed
    }
    tasks.insert(0, new_task) # Add the newest task to the top of the list
    save_tasks_to_file(tasks) # Save our updated list
    return jsonify(new_task), 201 # Send back the new task, confirming it was created


@app.route("/api/tasks/<task_id>", methods=["PUT"])
def update_task_api(task_id):

    update_data = request.get_json()
    tasks = load_tasks_from_file()
    task_found = False

    for task in tasks:
        if task["id"] == task_id:

            # Update name if provided and not empty

            if "name" in update_data and update_data["name"].strip():
                task["name"] = update_data["name"].strip()


            # Update completion status if provided

            if "completed" in update_data:
                task["completed"] = update_data["completed"]
            task_found = True
            break

    if not task_found:
        return jsonify({"error": "Task not found."}), 404 

    save_tasks_to_file(tasks) # Save the changes
    return jsonify({"message": "Task updated successfully."})


@app.route("/api/tasks/<task_id>", methods=["DELETE"])
def delete_task_api(task_id):

    tasks = load_tasks_from_file()
    initial_task_count = len(tasks)

    # Create a new list without the task to be deleted

    tasks = [task for task in tasks if task["id"] != task_id]


    if len(tasks) == initial_task_count:
        return jsonify({"error": "Task not found."}), 404 

    save_tasks_to_file(tasks) # Save the new (smaller) list
    return jsonify({"message": "Task deleted successfully."})


if __name__ == "__main__":
    app.run(debug=True)