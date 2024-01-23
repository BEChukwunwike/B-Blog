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

app.get('/create-post', (req, res) =>{
    res.render('create-post');
})

app.post('/create-post', async (req, res) => {
    const { title, content } = req.body;
  
    // Validate input (optional)
  
    const newPost = {
      id: generateUniqueId(), // Implement ID generation
      title,
      content,
    };
  
    // Store the post in local storage
    try {
        localStorage.setItem('myblog_post', JSON.stringify(newPost));
      
        // Send response or redirect (update client-side)
      
        res.send({ message: 'Post created successfully!' }); // Or redirect to '/'
        res.redirect('/'); // Successful post creation
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).send({ message: 'Something went wrong. Please try again later.' }); // Send generic error message
    }
        console.error(error); // Log the error
        res.status(500).send({ message: 'Something went wrong. Please try again later.' }); // Send generic error message
  });
  
// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});