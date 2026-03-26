let slideIndex = 0;

// Store student data
const certifiedStudents = [
    {
        name: "Rethessh E D",
        title: "Google Cloud Associate Engineer",
        image: "https://i.ibb.co/kVwbb7H8/Associate-Cloud-Engineer20250330-26-vsidgz-page-0001.jpg"
    },
    {
        name: " Jaswanth Gangavarapu",
        title: "Google Cloud Associate Engineer",
        image: "https://i.ibb.co/KcjWtMfk/1739332281204.jpg"
    },   {
        name: " Dhiraj Chaudhari",
        title: "Associate Data Practitioner",
        image: "https://i.ibb.co/zHR7yKNf/Associate-Data-Practitioner20251208-32-xztl8n-page-0001.jpg"
    },
    {
        name: "Tohid Hanfi",
        title: " Google Cloud Professional DevOps Engineer",
        image: "https://i.ibb.co/tTXbf2h2/1741480255586.jpg"
    },

    {
        name: "Vastav Nissan Swain",
        title: "Google Cloud Professional Cloud Security Engineer",
        image: "https://i.ibb.co/XxkDTHjT/Professional-Cloud-Security-Engineer-Copy20250822-31-od0282-page-0001.jpg"
    },

    {
        name: "Dhiraj Chaudhari",
        title: "Google Cloud Professional Cloud Architect ",
        image: "https://i.ibb.co/HQSrrBH/Professional-Cloud-Architect20251124-31-xahfmr-page-0001.jpg"
    },


    {
        name: "Dinesh Borase",
        title: "Google Cloud Associate Engineer",
        image: "https://i.ibb.co/DDyGLfJh/Associate-Cloud-Engineer20250406-27-1wijl0-page-0001.jpg"
    },

    {
        name: "Prachi Kamble",
        title: "Google Cloud Associate Engineer",
        image: "https://i.ibb.co/S4fx95CZ/Associate-Cloud-Engineer20250428-26-jt5zf7-page-0001.jpg"
    },
    {
        name: "MD GANIM",
        title: "Google Cloud Associate Engineer",
        image: "https://i.ibb.co/9HzbWYq0/1758947207781-page-0001.jpg"
    },

    {
        name: "Atharva Kumbhar",
        title: "Google Cloud Associate Engineer",
        image: "https://i.ibb.co/Kx74WZxD/IMG-8244.jpgin?t=sxbir7"
    },

    {
        name: "Dhiraj Chaudhari",
        title: "Google Cloud Generative AI Leader",
        image: "https://i.ibb.co/NgnyH00g/Generative-AILeader20250728-31-wx4pb9-page-0001.jpg"
    },

];



// Generate slides dynamically
const slider = document.getElementById("slider");

if (slider) {
    certifiedStudents.forEach(student => {
        const slide = document.createElement("div");
        slide.classList.add("certificate-slide");
        slide.innerHTML = `
            <img src="${student.image}" alt="${student.title}">
            <h3>${student.title} - ${student.name}</h3>
        `;
        slider.appendChild(slide);
    });
}

const totalSlides = certifiedStudents.length;

function moveSlide(step) {
    slideIndex = (slideIndex + step + totalSlides) % totalSlides;
    slider.style.transform = `translateX(-${slideIndex * 100}%)`;
}

// Auto-slide every 4 seconds
setInterval(() => moveSlide(1), 5000);
