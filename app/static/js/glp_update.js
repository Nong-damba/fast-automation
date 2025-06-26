export function initGlpUpdate() {
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
} 