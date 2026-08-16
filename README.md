# 📝 Task Flow – Google Keep-Style Task Manager

A lightweight, self-hosted note-taking application inspired by **Google Keep**, featuring a beautiful **Glassmorphism UI** and powered by a **Flask** backend with a dynamic **Vanilla JavaScript** frontend.

Designed for simplicity and productivity, the application supports plain text notes, interactive checklists, labels, pinned notes, and inline editing—all without requiring a database.

---

## ✨ Features

### 📌 Note Management
- Create, edit, and delete notes
- Pin important notes to the top
- Automatic save on edit
- Clean card-based layout

### ✅ Interactive Checklists
- Convert notes into checklists
- Convert checklists back into plain text
- Mark checklist items as complete
- Edit checklist items inline

### 🏷 Label Organization
- Add custom labels
- Edit existing labels
- Remove labels
- Organize notes by category

### ✏️ Inline Editing
- Edit titles directly
- Edit note content without opening a new page
- Automatic save on blur
- Live UI updates

### 📱 Mobile Optimized
- Responsive design
- Android-friendly input handling
- Prevents unwanted browser zoom
- Larger touch targets
- Removes blue tap highlights

### 🎨 Modern Glassmorphism UI
- Frosted glass cards
- Soft gradients
- Backdrop blur effects
- Smooth animations
- Clean and minimal interface

### ☁️ Vercel Ready
- Serverless deployment support
- Automatic `/tmp` storage fallback
- Includes `vercel.json` configuration

---

# 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Python | Backend Language |
| Flask | Web Framework |
| HTML5 | Structure |
| CSS3 | Glassmorphism Styling |
| Vanilla JavaScript (ES6) | Frontend Logic |
| Fetch API | Client-Server Communication |
| JSON | Local Data Storage |
| Vercel | Deployment |

---

# 📂 Project Structure

```text
task-manager/
│
├── data/
│   └── tasks.json                 # Local JSON storage
│
├── static/
│   ├── css/
│   │   └── style.css              # Glassmorphism styles
│   │
│   └── js/
│       └── main.js                # Frontend logic
│
├── templates/
│   └── index.html                 # Main application page
│
├── app.py                         # Flask server & REST API
├── requirements.txt               # Python dependencies
├── vercel.json                    # Vercel deployment config
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/vivekjoshi2006/Task-Manager.git
```

## 2. Navigate to the Project

```bash
cd task-manager
```

## 3. Create a Virtual Environment (Optional but Recommended)

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

## 5. Run the Application

```bash
python app.py
```

## 6. Open in Your Browser

```
http://127.0.0.1:5000
```

---

# 📡 REST API

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/tasks` | Fetch all notes |
| POST | `/api/tasks` | Create a new note |
| PUT | `/api/tasks/<id>` | Update a note |
| DELETE | `/api/tasks/<id>` | Delete a note |

---

# 💾 Data Storage

The application stores notes locally in:

```text
data/tasks.json
```

When deployed on **Vercel**, it automatically switches to:

```text
/tmp/tasks.json
```

to support writable serverless storage.

---

# 🎨 UI Highlights

- Frosted Glass Cards
- Smooth Blur Effects
- Responsive Layout
- Interactive Checklist Controls
- Inline Editing
- Soft Color Gradients
- Mobile-Friendly Design

---

# 📱 Mobile Support

Optimized for modern mobile browsers with:

- Responsive layouts
- Large touch targets
- Android keyboard zoom prevention
- Disabled tap highlights
- Smooth scrolling experience

---

# ☁️ Deploying to Vercel

This project is already configured for deployment.

Simply:

```bash
vercel
```

or connect your GitHub repository to **Vercel** and deploy.

No additional configuration is required.

---

# 📦 Requirements

- Python 3.9+
- Flask
- Modern Web Browser

Install all dependencies using:

```bash
pip install -r requirements.txt
```

---

# 🚀 Future Improvements

- User authentication
- Rich text editor
- Image attachments
- Note archiving
- Trash & restore
- Dark mode
- Search functionality
- Label filtering
- Cloud database support
- User accounts & synchronization

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

Built with ❤️ using **Python**, **Flask**, and **Vanilla JavaScript**.

If you found this project useful, don't forget to ⭐ the repository!
