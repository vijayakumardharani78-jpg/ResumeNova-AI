fetch("/resume-data")
.then(res => res.json())
.then(data => {

    document.getElementById("fullname").innerText = data.fullname || "";
    document.getElementById("email").innerText = data.email || "";
    document.getElementById("phone").innerText = data.phone || "";
    document.getElementById("objective").innerText = data.objective || "";
    document.getElementById("skills").innerText = data.skills || "";
    document.getElementById("education").innerText = data.education || "";
    document.getElementById("experience").innerText = data.experience || "";
    document.getElementById("projects").innerText = data.projects || "";

    if(data.photo){

        document.getElementById("photo").src =
        "/uploads/" + data.photo;

    }

});