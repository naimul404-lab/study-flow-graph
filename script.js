const defaultTopics = [
  { id: 1, name: 'Variables', difficulty: 'Beginner', mastery: 70 },
  { id: 2, name: 'Loops', difficulty: 'Beginner', mastery: 60 },
  { id: 3, name: 'Functions', difficulty: 'Beginner', mastery: 50 },
  { id: 4, name: 'Arrays', difficulty: 'Beginner', mastery: 65 },
  { id: 5, name: 'Sorting', difficulty: 'Intermediate', mastery: 35 },
  { id: 6, name: 'Recursion', difficulty: 'Intermediate', mastery: 25 },
  { id: 7, name: 'Binary Search', difficulty: 'Intermediate', mastery: 20 },
  { id: 8, name: 'Hash Maps', difficulty: 'Intermediate', mastery: 30 },
  { id: 9, name: 'Graphs', difficulty: 'Advanced', mastery: 15 },
  { id: 10, name: 'Dynamic Programming', difficulty: 'Advanced', mastery: 10 }
];

const dependencies = {
  1: [],
  2: [1],
  3: [1],
  4: [2, 3],
  5: [4],
  6: [3, 4],
  7: [4, 5],
  8: [4],
  9: [7, 8],
  10: [6, 7, 8]
};

let topics = [...defaultTopics];

function getTopicById(id) {
  return topics.find((item) => item.id === id);
}

function computeRecommendation() {
  const nextList = topics
    .map((topic) => {
      const prereqs = dependencies[topic.id] || [];
      const prereqAverage = prereqs.length
        ? prereqs.reduce((sum, id) => sum + (getTopicById(id)?.mastery || 0), 0) / prereqs.length
        : 100;

      let score = 0;
      if (topic.mastery < 60) score += 60;
      if (prereqAverage >= 55) score += 25;
      if (prereqAverage < 50 && topic.mastery < 50) score += 20;
      if (topic.difficulty === 'Advanced') score += 10;

      return {
        ...topic,
        score,
        prereqAverage
      };
    })
    .sort((a, b) => b.score - a.score)[0];

  return nextList;
}

function renderBestTopic() {
  const best = computeRecommendation();
  const bestReason = `${best.name} is a strong next step because its prerequisites are largely covered and its current mastery is ${best.mastery}%.`;

  document.getElementById('bestTopic').textContent = best.name;
  document.getElementById('bestTopicReason').textContent = bestReason;
}

function renderTopics() {
  const topicList = document.getElementById('topicList');
  const totalTopics = document.getElementById('totalTopics');
  const avgMastery = document.getElementById('avgMastery');
  const priorityCount = document.getElementById('priorityCount');

  topicList.innerHTML = '';

  const overallAverage = topics.length
    ? Math.round(topics.reduce((sum, item) => sum + item.mastery, 0) / topics.length)
    : 0;

  totalTopics.textContent = String(topics.length);
  avgMastery.textContent = `${overallAverage}%`;
  priorityCount.textContent = String(topics.filter((item) => item.mastery < 50).length);

  for (const topic of topics) {
    const card = document.createElement('article');
    card.className = 'topic-card';

    const prereqs = dependencies[topic.id] || [];

    card.innerHTML = `
      <div class="topic-top">
        <h4>${topic.name}</h4>
        <span class="badge">${topic.difficulty}</span>
      </div>
      <div class="meta">
        <span>Mastery: ${topic.mastery}%</span>
        <span>Prereqs: ${prereqs.length ? prereqs.map((id) => getTopicById(id)?.name || 'Unknown').join(', ') : 'None'}</span>
      </div>
      <div class="progress">
        <div class="progress-bar" style="width: ${Math.min(topic.mastery, 100)}%"></div>
      </div>
    `;

    topicList.appendChild(card);
  }

  renderBestTopic();
}

function resetDemo() {
  topics = [...defaultTopics];
  renderTopics();
}

document.getElementById('topicForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('topicName').value.trim();
  const difficulty = document.getElementById('difficulty').value;
  const mastery = Number(document.getElementById('mastery').value || 0);

  if (!name) return;

  const id = topics.length ? Math.max(...topics.map((item) => item.id)) + 1 : 1;
  topics.push({ id, name, difficulty, mastery });
  dependencies[id] = [];
  document.getElementById('topicForm').reset();
  renderTopics();
});

document.getElementById('resetData').addEventListener('click', resetDemo);

renderTopics();
