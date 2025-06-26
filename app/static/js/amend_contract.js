export function initAmendContract() {
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
} 