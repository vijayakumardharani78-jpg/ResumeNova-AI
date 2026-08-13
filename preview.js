fetch("/resume-data")
.then(response => response.json())
.then(data => {

    console.log(data);

    document.getElementById("fullname").innerText = data.fullname || "";
    document.getElementById("email").innerText = data.email || "";
    document.getElementById("phone").innerText = data.phone || "";
    document.getElementById("objective").innerText = data.objective || "";
    document.getElementById("skills").innerText = data.skills || "";
    document.getElementById("education").innerText = data.education || "";
    document.getElementById("experience").innerText = data.experience || "";
    document.getElementById("projects").innerText = data.projects || "";

    if (data.photo) {

        const photo = document.getElementById("photo");
        console.log("/uploads/" + data.photo);

        photo.src = "/uploads/" + data.photo;

        photo.style.display = "block";

    }

})
.catch(err => {

    console.log(err);

});
