// File upload handling
const fileInput = document.getElementById('file-input');
const fileName = document.getElementById('file-name');
const uploadForm = document.getElementById('upload-form');
const generateSqlBtn = document.getElementById('generate-sql-btn');
const sqlSection = document.getElementById('sql-section');
const sqlCode = document.getElementById('sql-code');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');

// Initially disable the generate button
generateSqlBtn.disabled = true;
generateSqlBtn.style.opacity = '0.5';
generateSqlBtn.style.cursor = 'not-allowed';

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileName.textContent = file.name;
        // Enable the generate button when a file is selected
        generateSqlBtn.disabled = false;
        generateSqlBtn.style.opacity = '1';
        generateSqlBtn.style.cursor = 'pointer';
    } else {
        fileName.textContent = 'No file selected';
        // Disable the generate button when no file is selected
        generateSqlBtn.disabled = true;
        generateSqlBtn.style.opacity = '0.5';
        generateSqlBtn.style.cursor = 'not-allowed';
    }
});

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file first');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/generate-sql', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            sqlCode.textContent = data.sql_script;
            sqlSection.style.display = 'block';
            // Highlight the SQL code
            hljs.highlightElement(sqlCode);
        } else {
            alert(data.message || 'Error generating SQL script');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating SQL script. Please try again.');
    }
});

// Copy SQL to clipboard
copyBtn.addEventListener('click', () => {
    const text = sqlCode.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy SQL to clipboard');
    });
});

// Download SQL file
downloadBtn.addEventListener('click', () => {
    const text = sqlCode.textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_script.sql';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
});

// Section switching logic
function showSection(sectionId) {
    document.getElementById('update-effective-date').style.display = sectionId === 'update-effective-date' ? 'block' : 'none';
    document.getElementById('amend-contract').style.display = sectionId === 'amend-contract' ? 'block' : 'none';
    document.getElementById('nav-effective-date').classList.toggle('active', sectionId === 'update-effective-date');
    document.getElementById('nav-amend-contract').classList.toggle('active', sectionId === 'amend-contract');
}

// Amend Contract form logic
const amendForm = document.getElementById('amend-form');
const amendGenerateBtn = document.getElementById('amend-generate-btn');
const amendSqlSection = document.getElementById('amend-sql-section');
const amendSqlCode = document.getElementById('amend-sql-code');
const amendCopyBtn = document.getElementById('amend-copy-btn');
const amendDownloadBtn = document.getElementById('amend-download-btn');
amendForm && amendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('amend-username').value.trim();
    const currentPolicy = document.getElementById('amend-current-policy').value.trim();
    const amendedPolicy = document.getElementById('amend-amended-policy').value.trim();
    if (!username || !currentPolicy || !amendedPolicy) {
        alert('Please fill in all fields.');
        return;
    }
    amendGenerateBtn.disabled = true;
    amendGenerateBtn.textContent = 'Generating...';
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('current_policy', currentPolicy);
        formData.append('amended_policy', amendedPolicy);
        const response = await fetch('/generate-amend-contract-sql', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            amendSqlCode.textContent = data.sql_script;
            amendSqlSection.style.display = 'block';
            hljs.highlightElement(amendSqlCode);
        } else {
            alert(data.message || 'Error generating SQL script');
        }
    } catch (error) {
        alert('Error generating SQL script. Please try again.');
    }
    amendGenerateBtn.disabled = false;
    amendGenerateBtn.textContent = 'Generate SQL';
});

// Copy and download for Amend Contract
amendCopyBtn && amendCopyBtn.addEventListener('click', () => {
    const text = amendSqlCode.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = amendCopyBtn.innerHTML;
        amendCopyBtn.innerHTML = 'Copied!';
        setTimeout(() => {
            amendCopyBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        alert('Failed to copy SQL to clipboard');
    });
});
amendDownloadBtn && amendDownloadBtn.addEventListener('click', () => {
    const text = amendSqlCode.textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'amend_contract.sql';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
});