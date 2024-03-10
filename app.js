const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth'); // For DOCX to text conversion
const pdf = require('pdf-parse'); // For PDF to text conversion

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Store uploaded content data
const uploadedContent = [];

// Landing page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Teacher's content upload
app.get('/upload', (req, res) => {
    res.sendFile(__dirname + '/public/upload.html');
});

app.post('/upload', upload.single('content'), (req, res) => {
    // Handle content upload logic here
    // You might want to save uploaded files, convert to audio using ChatGPT, etc.
    const uploadedFileName = req.file.filename;

    // Placeholder for content processing
    processContent(uploadedFileName);

    // Placeholder for ChatGPT API integration
    const audioContent = convertToAudio(uploadedFileName);


    // Respond with a HTML page displaying a gif and buttons
       // Respond with a HTML page displaying a check mark image and buttons
       res.send(`
       <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Content Uploaded</title>
    <style>
        body {
            text-align: center;
            padding: 20px;
            font-family: 'Comic Sans MS', cursive, sans-serif;
            background-color: #f0f0f0;
        }

        img {
            width: 150px;
            margin-bottom: 20px;
        }

        h2 {
            color: #4CAF50;
            font-size: 2em;
            margin-bottom: 20px;
        }

        .button-container {
            margin-top: 20px;
        }

        .button {
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 1.2em;
            margin: 0 10px;
            display: inline-block;
            transition: background-color 0.3s ease;
        }

        .return-home {
            background-color: #4CAF50;
            color: white;
        }

        .start-learning {
            background-color: #008CBA;
            color: white;
        }

        .button:hover {
            background-color: #333;
        }
    </style>
</head>
<body>
    <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXJ2MmlyZHlzZDEyZmRqZjV6MHJrdGswYmxuMDc1cnI1cWtzZWFldiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0BKFJ0RwWc3zlh2o/giphy.gif" alt="Check Mark GIF">
    <h2>Content uploaded successfully!</h2>

    <div class="button-container">
        <a href="/" class="button return-home">Return Home</a>
        <a href="/learn" class="button start-learning">Start Learning</a>
    </div>
</body>
</html>

   `);

    // res.send("Content uploaded successfully!");
});


// Function to convert PDF to text
function pdfToText(fileName) {
    const dataBuffer = fs.readFileSync(`uploads/${fileName}`);
    pdf(dataBuffer).then(data => {
        const textContent = data.text;
        console.log('PDF to text conversion result:', textContent);
        // Use 'textContent' for further processing or send it to ChatGPT API
    });
}

// Function to convert DOCX to text
function docxToText(fileName) {
    const dataBuffer = fs.readFileSync(`uploads/${fileName}`);
    mammoth.extractRawText({ arrayBuffer: dataBuffer })
        .then(result => {
            const textContent = result.value;
            console.log('DOCX to text conversion result:', textContent);
            // Use 'textContent' for further processing or send it to ChatGPT API
        });
}




// Placeholder function for content processing
function processContent(fileName) {
    const ext = path.extname(fileName).toLowerCase();

    if (ext === '.pdf') {
        // Convert PDF to text
        pdfToText(fileName);
    } else if (ext === '.docx') {
        // Convert DOCX to text
        docxToText(fileName);
    }
}

// Placeholder function for ChatGPT API integration
function convertToAudio(fileName) {
    // Replace this with actual ChatGPT API integration logic
    // Mocking the audio content for demonstration purposes
    const textContent = getFileContent(fileName);
    const audioUrl = generateAudioUrl(textContent);

    // Add the uploaded content to the list
    uploadedContent.push({
        title: path.basename(fileName, path.extname(fileName)),
        audioSrc: audioUrl,
    });

    // Save the content list to a JSON file
    saveContentList();

    return audioUrl;
}

// Function to get file content as text
function getFileContent(fileName) {
    const ext = path.extname(fileName).toLowerCase();

    if (ext === '.pdf') {
        // Read PDF content
        const dataBuffer = fs.readFileSync(`uploads/${fileName}`);
        const data = pdf(dataBuffer);
        return data.text;
    } else if (ext === '.docx') {
        // Read DOCX content
        const dataBuffer = fs.readFileSync(`uploads/${fileName}`);
        return mammoth.extractRawText({ arrayBuffer: dataBuffer })
            .then(result => result.value);
    }

    return '';
}

// Function to generate audio URL using Say.js for text-to-speech conversion
function generateAudioUrl(textContent) {
    return new Promise((resolve, reject) => {
        // Using Say.js to convert text to speech
        say.export(textContent, 'Microsoft David Desktop - English (United States)', 1.0, 'output.mp3', (err) => {
            if (err) {
                console.error('Error converting text to audio:', err);
                reject(err);
            } else {
                console.log('Text converted to audio successfully.');
                // Returning the generated audio URL
                resolve('/output.mp3');
            }
        });
    });
}

// Function to save the content list to a JSON file
function saveContentList() {
    fs.writeFileSync('public/contentList.json', JSON.stringify(uploadedContent), 'utf-8');
}



// Endpoint to get content data for learning page
app.get('/api/content', (req, res) => {
    // Provide uploaded content data
    res.json(uploadedContent);
});

// Learner's interaction
app.get('/learn', (req, res) => {
    res.sendFile(__dirname + '/public/learn.html');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
