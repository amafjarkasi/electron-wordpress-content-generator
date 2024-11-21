// Window controls
document.getElementById('minimize').addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
});

document.getElementById('close').addEventListener('click', () => {
    window.electronAPI.closeWindow();
});

// Content switching
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active nav link
        document.querySelector('nav a.active').classList.remove('active');
        e.target.classList.add('active');
        
        // Update content section
        const sectionId = e.target.getAttribute('data-section');
        document.querySelector('.content-section.active').classList.remove('active');
        document.getElementById(`${sectionId}-section`).classList.add('active');
    });
});
