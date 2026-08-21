require("dotenv").config();
const db = require("./db");
const express = require("express");
const path = require("path");
const multer = require("multer");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;
const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

/* ===========================
   MULTER SETUP
=========================== */

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

/* ===========================
   MIDDLEWARE
=========================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML, CSS, JS
app.use(express.static(__dirname));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));




/* ===========================
   GET ROUTES
=========================== */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "register.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

app.get("/resume", (req, res) => {
    res.sendFile(path.join(__dirname, "resume.html"));
});
app.get("/edit-resume", (req, res) => {
    res.sendFile(path.join(__dirname, "edit-resume.html"));
});

app.get("/preview", (req, res) => {
    res.sendFile(path.join(__dirname, "preview.html"));
});
app.get("/templates", (req, res) => {
    res.sendFile(path.join(__dirname, "templates.html"));
});
app.get("/template2", (req, res) => {
    res.sendFile(path.join(__dirname, "template2.html"));
});

app.get("/template3", (req, res) => {
    res.sendFile(path.join(__dirname, "template3.html"));
});

/* ===========================
   REGISTER
=========================== */

/* ===========================
   REGISTER
=========================== */

app.post("/register", (req, res) => {

    const { fullname, email, phone, password } = req.body;

    const sql = `
        INSERT INTO users (fullname, email, phone, password)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [fullname, email, phone, password], (err, result) => {

        if (err) {
            console.log("REGISTER ERROR:", err);

           return res.status(500).send(`
    <h2>Registration Database Error ❌</h2>
    <pre>
CODE: ${err.code}
MESSAGE: ${err.message}
SQL STATE: ${err.sqlState}
    </pre>
`);
        } 

        console.log("Registration successful ✅");
        console.log("Inserted ID:", result.insertId);

        res.redirect("/login");
    });

});
    
/* ===========================
   LOGIN
=========================== */

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email=? AND password=?";

    db.query(sql, [email, password], (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Login Failed ❌");
        }

        if (result.length > 0) {
            res.redirect("/dashboard");
        } else {
            res.send("Invalid Email or Password ❌");
        }

    });

});

/* ===========================
   SAVE RESUME
=========================== */
app.get("/preview", (req, res) => {
    res.sendFile(path.join(__dirname, "preview.html"));
});
app.get("/resume-data", (req, res) => {

    const sql = "SELECT * FROM resumes ORDER BY id DESC LIMIT 1";

    db.query(sql, (err, result) => {

        if (err) {
            console.log("RESUME DATA ERROR:", err);
            return res.status(500).json({
                error: "Database Error"
            });
        }

        if (!result || result.length === 0) {
            return res.status(404).json({
                error: "No Resume Found"
            });
        }

        res.json(result[0]);
    });

});
app.post("/resume", upload.single("photo"), (req, res) => {

    const photo = req.file ? req.file.filename : null;
    

    const {
        fullname,
        email,
        phone,
        address,
        objective,
        skills,
        education,
        experience,
        projects
    } = req.body;

    const sql = `
        INSERT INTO resumes
        (photo, fullname, email, phone, address, objective, skills, education, experience, projects)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            photo,
            fullname,
            email,
            phone,
            address,
            objective,
            skills,
            education,
            experience,
            projects
        ],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Resume Save Failed ❌");
            }

            console.log("Resume Saved Successfully ✅");

            res.redirect("/preview");

        }
    );

});

/* ===========================
   RESUME DATA
=========================== */
app.get("/download-pdf", async (req, res) => {

    const sql = "SELECT * FROM resumes ORDER BY id DESC LIMIT 1";

    db.query(sql, async (err, result) => {

        if (err) {
            console.log("PDF DATABASE ERROR:", err);
            return res.status(500).send("Database Error");
        }

        if (!result || result.length === 0) {
            return res.status(404).send("No Resume Found");
        }

        const data = result[0];

        let imageSrc = "";

if (data.photo) {
    const imagePath = path.join(__dirname, "uploads", data.photo);

    if (fs.existsSync(imagePath)) {
        const ext = path.extname(data.photo).toLowerCase();

        let mime = "image/jpeg";

        if (ext === ".png") mime = "image/png";
        if (ext === ".webp") mime = "image/webp";

        const base64 = fs.readFileSync(imagePath).toString("base64");

        imageSrc = `data:${mime};base64,${base64}`;
    }
}

        const html = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    color: #222;
                }

                h1 {
                    color: #1e3a8a;
                }

                h2 {
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 5px;
                    margin-top: 25px;
                }

                img {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    object-fit: cover;
                    float: right;
                }
                    
            </style>
        </head>

        <body>

        <body>

    ${imageSrc ? `<img src="${imageSrc}" class="profile-photo">` : ""}

    <h1>${data.fullname || ""}</h1>

            <h1>${data.fullname || ""}</h1>

            <p><b>Email:</b> ${data.email || ""}</p>
            <p><b>Phone:</b> ${data.phone || ""}</p>
            <p><b>Address:</b> ${data.address || ""}</p>

            <h2>Career Objective</h2>
            <p>${data.objective || ""}</p>

            <h2>Skills</h2>
            <p>${data.skills || ""}</p>

            <h2>Education</h2>
            <p>${data.education || ""}</p>

            <h2>Experience</h2>
            <p>${data.experience || ""}</p>

            <h2>Projects</h2>
            <p>${data.projects || ""}</p>

        </body>
        </html>
        `;
       
        let browser;

        try {

            browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage"
                ]
            });

            const page = await browser.newPage();

            await page.setContent(html, {
                waitUntil: "networkidle0"
            });

            await page.pdf({
                path: "./resume.pdf",
                format: "A4",
                printBackground: true,
                margin: {
                    top: "20px",
                    right: "20px",
                    bottom: "20px",
                    left: "20px"
                }
            });

            await browser.close();

            res.download("./resume.pdf", "ResumeNova-Resume.pdf", (downloadErr) => {

                if (downloadErr) {
                    console.log("PDF DOWNLOAD ERROR:", downloadErr);
                }

            });

        } catch (pdfError) {

            console.log("PDF GENERATION ERROR:", pdfError);

            if (browser) {
                try {
                    await browser.close();
                } catch (e) {
                    console.log("Browser close error:", e);
                }
            }

            return res.status(500).send("PDF Generation Failed");
        }

    });

});
/* ===========================
   SERVER
=========================== */
app.post("/generate-ai", async (req, res) => {

    try {

        const { role } = req.body;

        const prompt = `
Generate a professional resume for a ${role}.

Return ONLY valid JSON like this:

{
  "objective": "...",
  "skills": "...",
  "experience": "...",
  "projects": "..."
}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        res.send(response.text);

    } catch (err) {
        console.log(err);
        res.status(500).send("AI Error");
    }

});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
app.post("/update-resume", (req, res) => {   

    const {
        fullname,
        email,
        phone,
        address,
        objective,
        skills,
        education,
        experience,
        projects
    } = req.body;

    const sql = `
        UPDATE resumes
        SET
            fullname=?,
            email=?,
            phone=?,
            address=?,
            objective=?,
            skills=?,
            education=?,
            experience=?,
            projects=?
        ORDER BY id DESC
        LIMIT 1
    `;

    db.query(sql, [
        fullname,
        email,
        phone,
        address,
        objective,
        skills,
        education,
        experience,
        projects
    ], (err) => {

        if (err) {
            console.log(err);
            return res.send("Resume Update Failed ❌");
        }

        res.redirect("/preview");

    });

});
app.get("/delete-resume", (req, res) => {

    const sql = "DELETE FROM resumes ORDER BY id DESC LIMIT 1";

    db.query(sql, (err) => {

        if (err) {
            console.log(err);
            return res.send("Delete Failed ❌");
        }

        res.redirect("/dashboard");

    });

});
app.get("/ats-score", (req, res) => {
    res.sendFile(path.join(__dirname, "ats-score.html"));
});