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
    document.getElementById('update-status').style.display = sectionId === 'update-status' ? 'block' : 'none';
    document.getElementById('glp-update').style.display = sectionId === 'glp-update' ? 'block' : 'none';
    document.getElementById('nav-effective-date').classList.toggle('active', sectionId === 'update-effective-date');
    document.getElementById('nav-amend-contract').classList.toggle('active', sectionId === 'amend-contract');
    document.getElementById('nav-update-status').classList.toggle('active', sectionId === 'update-status');
    document.getElementById('nav-glp-update').classList.toggle('active', sectionId === 'glp-update');
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
        amendCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
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

// Update Policy Status form logic
const statusForm = document.getElementById('status-form');
const statusGenerateBtn = document.getElementById('status-generate-btn');
const statusSqlSection = document.getElementById('status-sql-section');
const statusSqlCode = document.getElementById('status-sql-code');
const statusCopyBtn = document.getElementById('status-copy-btn');
const statusDownloadBtn = document.getElementById('status-download-btn');

statusForm && statusForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('status-username').value.trim();
    const policyNumber = document.getElementById('status-policy').value.trim();
    const status = document.getElementById('status-select').value;
    if (!username || !policyNumber) {
        alert('Please fill in all fields.');
        return;
    }
    statusGenerateBtn.disabled = true;
    statusGenerateBtn.textContent = 'Generating...';
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('policy_number', policyNumber);
        formData.append('status', status);
        const response = await fetch('/generate-update-status-sql', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            statusSqlCode.textContent = data.sql_script;
            statusSqlSection.style.display = 'block';
            hljs.highlightElement(statusSqlCode);
        } else {
            alert(data.message || 'Error generating SQL script');
        }
    } catch (error) {
        alert('Error generating SQL script. Please try again.');
    }
    statusGenerateBtn.disabled = false;
    statusGenerateBtn.textContent = 'Generate SQL';
});

// Copy and download for Update Policy Status
statusCopyBtn && statusCopyBtn.addEventListener('click', () => {
    const text = statusSqlCode.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = statusCopyBtn.innerHTML;
        statusCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            statusCopyBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        alert('Failed to copy SQL to clipboard');
    });
});

statusDownloadBtn && statusDownloadBtn.addEventListener('click', () => {
    const text = statusSqlCode.textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'update_policy_status.sql';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
});

// GLP Update form logic
const glpForm = document.getElementById('glp-form');
const glpGenerateBtn = document.getElementById('glp-generate-btn');
const glpSqlSection = document.getElementById('glp-sql-section');
const glpSqlCode = document.getElementById('glp-sql-code');
const glpCopyBtn = document.getElementById('glp-copy-btn');
const glpDownloadBtn = document.getElementById('glp-download-btn');

glpForm && glpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('glp-username').value.trim();
    const policyNumber = document.getElementById('glp-policy').value.trim();
    const effectiveDate = document.getElementById('glp-effective-date').value;
    const glpAmount = document.getElementById('glp-amount').value.trim();
    const epdDate = document.getElementById('glp-epd-date').value;
    const note = document.getElementById('glp-note').value.trim();
    
    if (!username || !policyNumber || !effectiveDate || !glpAmount || !epdDate || !note) {
        alert('Please fill in all fields.');
        return;
    }
    
    glpGenerateBtn.disabled = true;
    glpGenerateBtn.textContent = 'Generating...';
    
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('policy_number', policyNumber);
        formData.append('effective_date', effectiveDate);
        formData.append('glp_amount', glpAmount);
        formData.append('epd_date', epdDate);
        formData.append('note', note);
        
        const response = await fetch('/generate-glp-update-sql', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            glpSqlCode.textContent = data.sql_script;
            glpSqlSection.style.display = 'block';
            hljs.highlightElement(glpSqlCode);
        } else {
            alert(data.message || 'Error generating SQL script');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating SQL script. Please try again.');
    }
    
    glpGenerateBtn.disabled = false;
    glpGenerateBtn.textContent = 'Generate SQL';
});

// Copy and download for GLP Update
glpCopyBtn && glpCopyBtn.addEventListener('click', () => {
    const text = glpSqlCode.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = glpCopyBtn.innerHTML;
        glpCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            glpCopyBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy SQL to clipboard');
    });
});

glpDownloadBtn && glpDownloadBtn.addEventListener('click', () => {
    const text = glpSqlCode.textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'glp_update.sql';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
});

// Sidebar resizer functionality
const sidebar = document.querySelector('.sidebar');
const resizer = document.querySelector('.sidebar-resizer');
let isResizing = false;

if (sidebar && resizer) {
    resizer.addEventListener('mousedown', function(e) {
        if (window.innerWidth <= 768) return; // Disable on mobile
        isResizing = true;
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        let newWidth = e.clientX - sidebar.getBoundingClientRect().left;
        newWidth = Math.max(120, Math.min(350, newWidth));
        sidebar.style.width = newWidth + 'px';
    });

    document.addEventListener('mouseup', function(e) {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });

    // Responsive: reset sidebar width on resize if mobile
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            sidebar.style.width = '';
        }
    });
}