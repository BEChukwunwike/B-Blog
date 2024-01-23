import express from "express";
import bodyParser from "body-parser";


const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/create-post" (req, res) =>{
    const title = req.body.title;
    const content = req.body.content;
      
    // ... your code for processing and storing the post data ...
})

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong! Please try again later.');
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});