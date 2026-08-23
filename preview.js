
console.log("PREVIEW JS LOADED");
fetch("/resume-data")
    .then(response => {

        if (!response.ok) {
            throw new Error("Resume data not found");
        }

        return response.json();
    })
    .then(data => {

        document.getElementById("fullname").textContent =
            data.fullname || "";

        document.getElementById("email").textContent =
            data.email || "";

        document.getElementById("phone").textContent =
            data.phone || "";

        document.getElementById("objective").textContent =
            data.objective || "";

        document.getElementById("skills").textContent =
            data.skills || "";

        document.getElementById("education").textContent =
            data.education || "";

        document.getElementById("experience").textContent =
            data.experience || "";

        document.getElementById("projects").textContent =
            data.projects || "";

        if (data.photo) {

            const photo = document.getElementById("photo");

            photo.src = "/uploads/" + data.photo;
            photo.style.display = "block";
        }

    })
    .catch(error => {

        console.error("PREVIEW ERROR:", error);

    });