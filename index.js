import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import session from "express-session"
import expressFlash from "express-flash"
import fs from "fs"; // Node.js file system module
import flash from "express-flash";

const app = express();
const port = 3000;

// Load environment variables from .env file if it exists
dotenv.config();

app.set('view engine', 'ejs');

// Configure static file serving
app.use(express.static('public'));

// Use session middleware for flash messages
app.use(session({
    secret: process.env.EMAIL_PASS, // Replace with a unique secret
    resave: false,
    saveUninitialized: true
}));

app.use(expressFlash());
// Use body-parser for form data handling
app.use(bodyParser.urlencoded({ extended: true }));

const posts = []; // Array to store posts

// Configure nodemailer with your email service provider details
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

function generateUniqueId() {
    return Math.random().toString(36).substring(2, 9);
}

function readPostsFromFile() {
    try {
        const data = fs.readFileSync('posts.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading posts from file:", error);
        return [];
    }
}

function writePostsToFile(posts) {
    // Implement logic to write posts to a file
    fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2), 'utf8');
}

app.get('/', (req, res) => {
    const posts = readPostsFromFile();
    res.render('index', { posts });
});

app.get('/create-post', (req, res) => {
    res.render('create-post');
});

app.get("/contact", (req, res) => {
    res.render("contact");
})

app.get('/edit-post/:id', async (req, res) => {
    const posts = await readPostsFromFile();
    const post = posts.find(p => p.id === req.params.id);
    if (!post) {
      res.status(404).send('Post not found');
      return;
    }
    res.render('edit-post', { post: post });
  });

// Route for handling post creation
app.post('/create-post', async (req, res) => {
    const { title, author, content } = req.body;

    // ... validation (optional) ...

    const newPost = {
        id: generateUniqueId(),
        title,
        author,
        content,
    };

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            // Read existing posts from the JSON file
            const existingPosts = readPostsFromFile();

            // Add the new post to the array
            existingPosts.push(newPost);

            // Write the updated array back to the JSON file
            fs.writeFileSync('posts.json', JSON.stringify(existingPosts, null, 2), 'utf8');

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

app.post('/update-post/:id', async (req, res) => {
    try {
      const posts = await readPostsFromFile();
      const post = posts.find(p => p.id === req.params.id);
  
      if (!post) {
        res.status(404).send('Post not found');
        return;
      }
  
      post.title = req.body.title;
      post.content = req.body.content;
  
      await writePostsToFile(posts);
  
      // Set a success flash message (server-side)
      req.flash('success', 'Post updated successfully!');
  
      // Redirect to the home page
      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating post');
    }
  });  

app.post('/submit-contact', async (req, res) => {
    const { name, email, message } = req.body;

    // ... validation (optional) ...

    const mailOptions = {
        from: 'your_email@example.com',
        to: process.env.EMAIL_USER, 
        subject: 'New Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    try {
        // Send the email
        await transporter.sendMail(mailOptions);
        res.redirect('/'); // Redirect to the home page after successful submission
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to send message. Please try again later.' });
    }
});
// Function to save posts to a file (optional)
function savePostsToFile(posts) {
    const data = JSON.stringify(posts, null, 2);
    fs.writeFileSync('posts.json', data, 'utf8');
}

app.delete('/delete-post/:id', async (req, res) => {
    try {
      const posts = await fs.promises.readFile('posts.json', 'utf-8'); // Corrected typo here
      const parsedPosts = JSON.parse(posts);
      const filteredPosts = parsedPosts.filter(post => post.id !== req.params.id);
      await fs.promises.writeFile('posts.json', JSON.stringify(filteredPosts)); // Corrected typo here
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ success: false, error: 'Failed to delete post' });
    }
  });
  
// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});