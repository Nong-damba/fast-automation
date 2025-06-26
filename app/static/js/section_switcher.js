export function initSectionSwitcher() {
    function showSection(sectionId) {
        console.log('Switching to section:', sectionId);

        document.getElementById('update-effective-date').style.display = sectionId === 'update-effective-date' ? 'block' : 'none';
        document.getElementById('amend-contract').style.display = sectionId === 'amend-contract' ? 'block' : 'none';
        document.getElementById('update-status').style.display = sectionId === 'update-status' ? 'block' : 'none';
        document.getElementById('glp-update').style.display = sectionId === 'glp-update' ? 'block' : 'none';
        document.getElementById('epd-update').style.display = sectionId === 'epd-update' ? 'block' : 'none';

        document.getElementById('nav-effective-date').classList.toggle('active', sectionId === 'update-effective-date');
        document.getElementById('nav-amend-contract').classList.toggle('active', sectionId === 'amend-contract');
        document.getElementById('nav-update-status').classList.toggle('active', sectionId === 'update-status');
        document.getElementById('nav-glp-update').classList.toggle('active', sectionId === 'glp-update');
        document.getElementById('nav-epd-update').classList.toggle('active', sectionId === 'epd-update');
    }
    window.showSection = showSection;
} 