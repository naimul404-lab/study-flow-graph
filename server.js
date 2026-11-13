const app = require('./app');
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`StudyFlow Graph running at http://localhost:${port}`);
});
