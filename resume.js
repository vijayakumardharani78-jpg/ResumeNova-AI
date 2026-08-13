document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("aiBtn").addEventListener("click", function () {

        document.getElementById("objective").value =
        "Seeking a challenging Software Developer position where I can apply my technical skills and continuously learn new technologies.";

        document.getElementById("skills").value =
`HTML
CSS
JavaScript
Node.js
Express.js
MySQL
Git
GitHub`;

        document.getElementById("projects").value =
`• ResumeNova AI
• Student Management System
• Portfolio Website`;

        alert("AI Suggestions Added Successfully!");

    });

});