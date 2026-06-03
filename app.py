from flask import Flask, render_template, request, jsonify
import json
import os
import uuid

app = Flask(__name__) 
IS_VERCEL = "VERCEL" in os.environ

if IS_VERCEL:
    DATA_DIR = "/tmp"
    TASKS_FILE_PATH = os.path.join(DATA_DIR, "tasks.json")
    BUNDLED_TASKS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "tasks.json")

else:
    DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    TASKS_FILE_PATH = os.path.join(DATA_DIR, "tasks.json")
    BUNDLED_TASKS_PATH = TASKS_FILE_PATH

os.makedirs(DATA_DIR, exist_ok=True)

def load_tasks_from_file():
    if IS_VERCEL and not os.path.exists(TASKS_FILE_PATH):
        try:
            if os.path.exists(BUNDLED_TASKS_PATH) and os.path.getsize(BUNDLED_TASKS_PATH) > 0:
                with open(BUNDLED_TASKS_PATH, "r", encoding="utf-8") as src, open(TASKS_FILE_PATH, "w", encoding="utf-8") as dest:
                    dest.write(src.read())
        except Exception as e:
            print(f"Warning: Failed to copy bundled tasks to /tmp: {e}")

    if not os.path.exists(TASKS_FILE_PATH) or os.path.getsize(TASKS_FILE_PATH) == 0:
        return []

    try:
        with open(TASKS_FILE_PATH, "r", encoding="utf-8") as file:
            notes = json.load(file)


            for note in notes:
                if 'id' not in note:
                    note['id'] = str(uuid.uuid4())
                if 'title' not in note:
                    note['title'] = ""
                if 'is_checklist' not in note:
                    note['is_checklist'] = False
                if 'checklist_items' not in note:
                    note['checklist_items'] = []
                if 'label' not in note:
                    note['label'] = ""
                if 'pinned' not in note:
                    note['pinned'] = False
                if 'content' not in note:
                    note['content'] = note.get('name', '')
            return notes
        

    except json.JSONDecodeError:
        print(f"Warning: '{TASKS_FILE_PATH}' is corrupted. Starting empty.")
        return []
    

def save_tasks_to_file(notes_list):
    with open(TASKS_FILE_PATH, "w", encoding="utf-8") as file:
        json.dump(notes_list, file, indent=4)


@app.route("/")
def render_main_page():
    return render_template("index.html")


@app.route("/api/tasks", methods=["GET"])
def get_all_tasks_api():
    notes = load_tasks_from_file()

    # Pin sorting matches Keep behavior: Pinned notes are sorted to the top
    
    sorted_notes = sorted(notes, key=lambda n: (not n.get('pinned', False)))
    return jsonify(sorted_notes)


@app.route("/api/tasks", methods=["POST"])
def add_new_task_api():
    task_data = request.get_json() 
    title = task_data.get("title", "").strip()
    content = task_data.get("content", "")
    is_checklist = task_data.get("is_checklist", False)
    checklist_items = task_data.get("checklist_items", [])
    label = task_data.get("label", "").strip()
    pinned = task_data.get("pinned", False)

    if not title and not content and not checklist_items and not label:
        return jsonify({"error": "Note cannot be empty."}), 400

    notes = load_tasks_from_file()
    new_note = {
        "id": str(uuid.uuid4()),
        "title": title,
        "content": content,
        "is_checklist": is_checklist,
        "checklist_items": checklist_items,
        "label": label,
        "pinned": pinned
    }
    notes.insert(0, new_note)
    save_tasks_to_file(notes)
    return jsonify(new_note), 201


@app.route("/api/tasks/<task_id>", methods=["PUT"])
def update_task_api(task_id):
    update_data = request.get_json()
    notes = load_tasks_from_file()
    note_found = False

    for note in notes:
        if note["id"] == task_id:
            if "title" in update_data:
                note["title"] = update_data["title"].strip()
            if "content" in update_data:
                note["content"] = update_data["content"]
            if "is_checklist" in update_data:
                note["is_checklist"] = update_data["is_checklist"]
            if "checklist_items" in update_data:
                note["checklist_items"] = update_data["checklist_items"]
            if "label" in update_data:
                note["label"] = update_data["label"].strip()
            if "pinned" in update_data:
                note["pinned"] = update_data["pinned"]
            note_found = True
            break

    if not note_found:
        return jsonify({"error": "Note not found."}), 404 

    save_tasks_to_file(notes)
    return jsonify({"message": "Note updated successfully."})


@app.route("/api/tasks/<task_id>", methods=["DELETE"])
def delete_task_api(task_id):
    notes = load_tasks_from_file()
    initial_count = len(notes)
    notes = [note for note in notes if note["id"] != task_id]

    if len(notes) == initial_count:
        return jsonify({"error": "Note not found."}), 404 

    save_tasks_to_file(notes)
    return jsonify({"message": "Note deleted successfully."})

if __name__ == "__main__":
    app.run(debug=True)
