const path = require('node:path');
const fs = require('node:fs');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'data', 'studyflow.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    difficulty TEXT NOT NULL DEFAULT 'Beginner',
    mastery INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    dependency_id INTEGER NOT NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (dependency_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE(topic_id, dependency_id)
  );
`);

function getTopicById(id) {
  const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(id);
  if (!topic) return null;
  const prerequisites = db.prepare(`
    SELECT t.id, t.name, t.mastery, t.difficulty
    FROM topics t
    INNER JOIN dependencies d ON d.dependency_id = t.id
    WHERE d.topic_id = ?
    ORDER BY t.name COLLATE NOCASE
  `).all(id);
  return { ...topic, prerequisites };
}

function listTopics() {
  return db.prepare('SELECT * FROM topics ORDER BY name COLLATE NOCASE').all();
}

function createTopic(name, difficulty = 'Beginner', mastery = 0, notes = '') {
  const result = db.prepare('INSERT INTO topics (name, difficulty, mastery, notes) VALUES (?, ?, ?, ?)').run(
    name.trim(),
    difficulty.trim(),
    Number(mastery) || 0,
    notes ? notes.trim() : ''
  );
  return getTopicById(result.lastInsertRowid);
}

function updateTopic(id, payload = {}) {
  const allowed = ['name', 'difficulty', 'mastery', 'notes'];
  const updates = [];
  const values = [];

  for (const key of allowed) {
    if (payload[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(key === 'mastery' ? Number(payload[key]) || 0 : String(payload[key]).trim());
    }
  }

  if (!updates.length) return getTopicById(id);
  values.push(id);
  db.prepare(`UPDATE topics SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  return getTopicById(id);
}

function addDependency(topicId, dependencyId) {
  if (topicId === dependencyId) return false;
  db.prepare('INSERT OR IGNORE INTO dependencies (topic_id, dependency_id) VALUES (?, ?)').run(topicId, dependencyId);
  return true;
}

function removeDependency(topicId, dependencyId) {
  return db.prepare('DELETE FROM dependencies WHERE topic_id = ? AND dependency_id = ?').run(topicId, dependencyId).changes > 0;
}

function deleteTopic(id) {
  return db.prepare('DELETE FROM topics WHERE id = ?').run(id).changes > 0;
}

function getRecommendations() {
  const topics = db.prepare('SELECT * FROM topics ORDER BY name COLLATE NOCASE').all();
  const byId = new Map(topics.map((topic) => [topic.id, topic]));
  const graph = new Map();

  for (const topic of topics) {
    if (!graph.has(topic.id)) graph.set(topic.id, []);
    const prereqs = db.prepare('SELECT dependency_id FROM dependencies WHERE topic_id = ?').all(topic.id);
    for (const row of prereqs) {
      graph.get(topic.id).push(row.dependency_id);
    }
  }

  const recommended = topics
    .map((topic) => {
      const prerequisiteIds = graph.get(topic.id) || [];
      const maxPrereqMastery = prerequisiteIds.length
        ? Math.max(...prerequisiteIds.map((id) => byId.get(id)?.mastery || 0))
        : 0;

      const score = (topic.mastery < 60 ? 70 : 25) + Math.max(0, maxPrereqMastery - topic.mastery) + (topic.mastery < 40 ? 15 : 0);
      return { ...topic, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return recommended;
}

module.exports = {
  db,
  listTopics,
  getTopicById,
  createTopic,
  updateTopic,
  addDependency,
  removeDependency,
  deleteTopic,
  getRecommendations
};
