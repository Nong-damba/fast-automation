export function initEpdUpdate() {
    const epdForm = document.getElementById('epd-form');
    const epdGenerateBtn = document.getElementById('epd-generate-btn');
    const epdSqlSection = document.getElementById('epd-sql-section');
    const epdSqlCode = document.getElementById('epd-sql-code');
    const epdCopyBtn = document.getElementById('epd-copy-btn');
    const epdDownloadBtn = document.getElementById('epd-download-btn');

    epdForm && epdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('epd-username').value.trim();
        const policyNo = document.getElementById('epd-policy').value.trim();
        const epdDate = document.getElementById('epd-date').value;

        if (!username || !policyNo || !epdDate) {
            alert('Please fill in all fields.');
            return;
        }

        epdGenerateBtn.disabled = true;
        epdGenerateBtn.textContent = 'Generating...';

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('policy_no', policyNo);
            formData.append('epd_date', epdDate);

            const response = await fetch('/generate-epd-update-sql', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                epdSqlCode.textContent = data.sql_script;
                epdSqlSection.style.display = 'block';
                hljs.highlightElement(epdSqlCode);
            } else {
                alert(data.message || 'Error generating SQL script');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating SQL script. Please try again.');
        }

        epdGenerateBtn.disabled = false;
        epdGenerateBtn.textContent = 'Generate SQL';
    });

    epdCopyBtn && epdCopyBtn.addEventListener('click', () => {
        const text = epdSqlCode.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = epdCopyBtn.innerHTML;
            epdCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                epdCopyBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy SQL to clipboard');
        });
    });

    epdDownloadBtn && epdDownloadBtn.addEventListener('click', () => {
        const text = epdSqlCode.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'epd_update.sql';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
} 