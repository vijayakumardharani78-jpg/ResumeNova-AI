require("dotenv").config();
const db = require("./db");
const express = require("express");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
const fs = require("fs");
const pdf = require("html-pdf");
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
        INSERT INTO users(fullname, email, phone, password)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [fullname, email, phone, password],
        (err, result) => {

            if (err) {

                console.log("========== REGISTER ERROR ==========");
                console.log("Code:", err.code);
                console.log("Message:", err.message);
                console.log("SQL State:", err.sqlState);
                console.log("====================================");

                if (err.code === "ER_DUP_ENTRY") {
                    return res.send("❌ Email already registered.");
                }

                return res.status(500).send("Registration Failed ❌");
            }

            console.log("Registration successful ✅");
            console.log("Inserted ID:", result.insertId);

            res.redirect("/login");
        }
    );

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

app.get("/resume-data", (req, res) => {

    const sql = "SELECT * FROM resumes ORDER BY id DESC LIMIT 1";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.json({ error: "Database Error" });
        }

        res.json(result[0]);

    });

});
app.get("/download-pdf", (req, res) => {

    const sql = "SELECT * FROM resumes ORDER BY id DESC LIMIT 1";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        const data = result[0];

        const html = `
        <html>
        <head>
            <style>
                body{
                    font-family: Arial;
                    padding:40px;
                }
                h1{
                    color:#1e3a8a;
                }
                h2{
                    border-bottom:1px solid #ccc;
                    padding-bottom:5px;
                }
                img{
                    width:120px;
                    height:120px;
                    border-radius:50%;
                    object-fit:cover;
                    float:right;
                }
            </style>
        </head>

        <body>

           ${
    data.photo
    ? `<img src="http://localhost:${PORT}/uploads/${data.photo}">`
    : ""
}
            <h1>${data.fullname}</h1>

            <p><b>Email:</b> ${data.email}</p>
            <p><b>Phone:</b> ${data.phone}</p>
            <p><b>Address:</b> ${data.address}</p>

            <h2>Career Objective</h2>
            <p>${data.objective}</p>

            <h2>Skills</h2>
            <p>${data.skills}</p>

            <h2>Education</h2>
            <p>${data.education}</p>

            <h2>Experience</h2>
            <p>${data.experience}</p>

            <h2>Projects</h2>
            <p>${data.projects}</p>

        </body>
        </html>
        `;

       pdf.create(html, {
    base: "file:///" + __dirname.replace(/\\/g, "/") + "/"
}).toFile("./resume.pdf", (err) =>  {

            if (err) {
                console.log(err);
                return res.send("PDF Failed");
            }

            res.download("./resume.pdf");

        });

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