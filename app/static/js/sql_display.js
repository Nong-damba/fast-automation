export function initSqlDisplay() {
    const sqlCode = document.getElementById('sql-code');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const editBtn = document.getElementById('edit-btn');

    editBtn && editBtn.addEventListener('click', () => {
        if (sqlCode.isContentEditable) {
            sqlCode.contentEditable = 'false';
            sqlCode.style.border = "1px solid transparent";
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        } else {
            sqlCode.contentEditable = 'true';
            sqlCode.style.border = "1px solid #ccc";
            editBtn.innerHTML = '<i class="fas fa-save"></i> Save';
            sqlCode.focus();
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
} 