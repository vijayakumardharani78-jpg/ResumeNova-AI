fetch("/resume-data")
.then(res => res.json())
.then(data => {

window.resume = data;

});

function checkScore(){

let score = 0;

if(resume.fullname) score += 10;
if(resume.email) score += 10;
if(resume.phone) score += 10;
if(resume.objective) score += 15;
if(resume.skills) score += 20;
if(resume.education) score += 15;
if(resume.experience) score += 10;
if(resume.projects) score += 10;

document.getElementById("score").innerHTML = score + "%";

let msg="";

if(score>=90)
msg="🏆 Excellent Resume";

else if(score>=70)
msg="👍 Good Resume. Add more experience.";

else
msg="⚠️ Improve Skills & Projects.";

document.getElementById("feedback").innerHTML=msg;

}