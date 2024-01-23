import express from "express";
import bodyParser from "body-parser";


const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// Configure static file serving
app.use(express.static('public'));

// Use body-parser for form data handling
app.use(bodyParser.urlencoded({ extended: true }));

function generateUniqueId() {
    return Math.random().toString(36).substring(2, 9); // Example implementation
  }

// Route for homepage with dynamic post display
app.get('/', async (req, res) => {
  res.render('index');
});

app.get('/create-post', (req, res) => {
    res.render("create-post");
})

app.get('/contact', (req, res) => {
    res.render("contact");
})

app.post('/create-post', async (req, res) => {
  const { title, content } = req.body;

  // ... validation (optional) ...

  const newPost = {
    id: generateUniqueId(),
    title,
    content,
  };

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      localStorage.setItem('myblog_post', JSON.stringify(newPost));
      res.redirect('/'); // Successful post creation
      break; // Exit the loop if successful
    } catch (error) {
      attempts++;
      console.error(error);

      if (attempts < maxAttempts) {
        // Retry with a delay
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
      } else {
        // Max attempts reached, send error message
        res.status(500).send({ message: 'Failed to save post after multiple attempts. Please try again later.' });
      }
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});