export function initFundNameChange() {
    const fundForm = document.getElementById('fund-name-change-form');
    const fundGenerateBtn = document.getElementById('fund-generate-btn');
    const fundSqlSection = document.getElementById('fund-sql-section');
    const fundSqlCode = document.getElementById('fund-sql-code');
    const fundCopyBtn = document.getElementById('fund-copy-btn');
    const fundDownloadBtn = document.getElementById('fund-download-btn');
    const fundEditBtn = document.getElementById('fund-edit-btn');

    fundForm && fundForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('fund-username').value.trim();
        const cusipId = document.getElementById('fund-cusip-id').value.trim();
        const parentCompanyCode = document.getElementById('fund-parent-company-code').value.trim();
        const newFundName = document.getElementById('fund-new-name').value.trim();
        const newFundDescription = document.getElementById('fund-new-description').value.trim();
        
        if (!username || !cusipId || !parentCompanyCode || !newFundName || !newFundDescription) {
            alert('Please fill in all fields.');
            return;
        }
        
        fundGenerateBtn.disabled = true;
        fundGenerateBtn.textContent = 'Generating...';
        
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('cusip_id', cusipId);
            formData.append('parent_company_code', parentCompanyCode);
            formData.append('new_fund_name', newFundName);
            formData.append('new_fund_description', newFundDescription);
            
            const response = await fetch('/generate-fund-name-change-sql', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                fundSqlCode.textContent = data.sql_script;
                fundSqlSection.style.display = 'block';
                hljs.highlightElement(fundSqlCode);
            } else {
                alert(data.message || 'Error generating SQL script');
            }
        } catch (error) {
            alert('Error generating SQL script. Please try again.');
        }
        
        fundGenerateBtn.disabled = false;
        fundGenerateBtn.textContent = 'Generate SQL';
    });

    fundEditBtn && fundEditBtn.addEventListener('click', () => {
        if (fundSqlCode.isContentEditable) {
            fundSqlCode.contentEditable = 'false';
            fundSqlCode.style.border = "1px solid transparent";
            fundEditBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        } else {
            fundSqlCode.contentEditable = 'true';
            fundSqlCode.style.border = "1px solid #ccc";
            fundEditBtn.innerHTML = '<i class="fas fa-save"></i> Save';
            fundSqlCode.focus();
        }
    });

    // Copy and download for Fund Name Change
    fundCopyBtn && fundCopyBtn.addEventListener('click', () => {
        const text = fundSqlCode.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = fundCopyBtn.innerHTML;
            fundCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                fundCopyBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            alert('Failed to copy SQL to clipboard');
        });
    });

    fundDownloadBtn && fundDownloadBtn.addEventListener('click', () => {
        const text = fundSqlCode.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fund_name_change.sql';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
} 