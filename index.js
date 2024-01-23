import express from "express";
import bodyParser from "body-parser";


const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// Configure static file serving
app.use(express.static('public'));

// Use body-parser for form data handling
app.use(bodyParser.urlencoded({ extended: true }));

// Route for homepage with dynamic post display
app.get('/', (req, res) => {
  // Check for post data received from the client (e.g., query parameter)
  const postDataFromClient = req.query.postData;

  // If no data received, render the index template without a post
  if (!postDataFromClient) {
    res.render('index');
    return;
  }

  // Parse the received data
  const postData = JSON.parse(postDataFromClient);

  // Dynamically generate HTML for the post
  const postHtml = `
    <h2>${postData.title}</h2>
    <p>${postData.content}</p>
    <hr>
  `;

  // Render the index template with the generated post HTML
  res.render('index', { post: postHtml });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});