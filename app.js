const express = require('express');
const path = require('node:path');
const {
  listTopics,
  getTopicById,
  createTopic,
  updateTopic,
  addDependency,
  removeDependency,
  deleteTopic,
  getRecommendations
} = require('./database');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'StudyFlow Graph' });
});

app.get('/api/topics', (_req, res) => {
  res.json({ data: listTopics() });
});

app.get('/api/topics/:id', (req, res) => {
  const topic = getTopicById(Number(req.params.id));
  if (!topic) return res.status(404).json({ error: 'Topic not found.' });
  res.json({ data: topic });
});

app.post('/api/topics', (req, res) => {
  const { name, difficulty, mastery, notes } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Topic name is required.' });
  }
  const topic = createTopic(name, difficulty || 'Beginner', mastery || 0, notes || '');
  res.status(201).json({ data: topic });
});

app.put('/api/topics/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid topic id.' });
  const topic = updateTopic(id, req.body || {});
  if (!topic) return res.status(404).json({ error: 'Topic not found.' });
  res.json({ data: topic });
});

app.delete('/api/topics/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid topic id.' });
  if (!deleteTopic(id)) return res.status(404).json({ error: 'Topic not found.' });
  res.status(204).end();
});

app.post('/api/topics/:id/dependencies', (req, res) => {
  const topicId = Number(req.params.id);
  const dependencyId = Number(req.body?.dependencyId);
  if (!Number.isSafeInteger(topicId) || topicId < 1) return res.status(400).json({ error: 'Invalid topic id.' });
  if (!Number.isSafeInteger(dependencyId) || dependencyId < 1) return res.status(400).json({ error: 'Invalid dependency id.' });
  if (!addDependency(topicId, dependencyId)) return res.status(400).json({ error: 'Dependency could not be added.' });
  res.status(201).json({ data: getTopicById(topicId) });
});

app.delete('/api/topics/:id/dependencies/:dependencyId', (req, res) => {
  const topicId = Number(req.params.id);
  const dependencyId = Number(req.params.dependencyId);
  if (!Number.isSafeInteger(topicId) || topicId < 1) return res.status(400).json({ error: 'Invalid topic id.' });
  if (!Number.isSafeInteger(dependencyId) || dependencyId < 1) return res.status(400).json({ error: 'Invalid dependency id.' });
  if (!removeDependency(topicId, dependencyId)) return res.status(404).json({ error: 'Dependency not found.' });
  res.status(204).end();
});

app.get('/api/recommendations', (_req, res) => {
  res.json({ data: getRecommendations() });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error.' });
});

module.exports = app;
