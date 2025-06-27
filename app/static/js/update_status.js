export function initUpdateStatus() {
    const statusForm = document.getElementById('status-form');
    const statusGenerateBtn = document.getElementById('status-generate-btn');
    const statusSqlSection = document.getElementById('status-sql-section');
    const statusSqlCode = document.getElementById('status-sql-code');
    const statusCopyBtn = document.getElementById('status-copy-btn');
    const statusDownloadBtn = document.getElementById('status-download-btn');
    const statusEditBtn = document.getElementById('status-edit-btn');

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

    statusEditBtn && statusEditBtn.addEventListener('click', () => {
        if (statusSqlCode.isContentEditable) {
            statusSqlCode.contentEditable = 'false';
            statusSqlCode.style.border = "1px solid transparent";
            statusEditBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        } else {
            statusSqlCode.contentEditable = 'true';
            statusSqlCode.style.border = "1px solid #ccc";
            statusEditBtn.innerHTML = '<i class="fas fa-save"></i> Save';
            statusSqlCode.focus();
        }
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
} 