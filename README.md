# StudyFlow Graph

StudyFlow Graph is a learning roadmap project that helps students track topics, dependencies, and mastery levels. It suggests the next concept to study based on weak areas and prerequisite structure.

## Features

- Add learning topics and assign a mastery level
- Track difficulty and notes for each topic
- Establish prerequisite relationships between topics
- Receive a recommended next study topic based on current mastery and dependency gaps
- See a full list of topics in the learning map
- Small stack for a strong CS portfolio

## Tech stack

- Node.js
- Express
- SQLite
- Plain HTML/CSS/JavaScript

## Run locally

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## Project structure

```text
study-flow-graph/
├── app.js
├── database.js
├── server.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── package.json
├── README.md
└── .gitignore
```

## Why it matters

This project demonstrates:

- graph-based thinking
- concept dependency modeling
- adaptive recommendation logic
- student-focused product design
- full-stack development

## License

MIT
