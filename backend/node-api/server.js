const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Acuity Node API is running');
});

app.listen(port, () => {
  console.log(`Node API server listening on port ${port}`);
});
