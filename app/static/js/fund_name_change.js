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

    // --- Fund Name Change Table View Logic ---
    const fundViewRowsBtn = document.getElementById('fund-view-rows-btn');
    const fundReloadTableBtn = document.getElementById('fund-reload-table-btn');
    const fundTableSection = document.getElementById('fund-table-section');
    const fundTableContainer = document.getElementById('fund-table-container');
    let lastFundTableRequest = null;

    async function fetchAndRenderFundTable(server, database, cusip, parentCompanyCode) {
        fundTableContainer.innerHTML = '<div>Loading...</div>';
        try {
            const response = await fetch('/fetch-current-rows-fund-name-change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ server, database, cusip, parent_company_code: parentCompanyCode })
            });
            const data = await response.json();
            if (data.error) {
                fundTableContainer.innerHTML = `<div class=\"error\">${data.error}</div>`;
            } else if (data.columns && data.rows) {
                if (data.rows.length === 0) {
                    fundTableContainer.innerHTML = '<div>No data found for this CUSIP and parent company code.</div>';
                } else {
                    // Transpose: fields as rows, records as columns
                    let tableHtml = '<div style="overflow-x:auto;overflow-y:auto;max-height:350px;">';
                    tableHtml += '<table class="epd-data-table" style="min-width:500px;width:auto;border-collapse:collapse;margin-top:10px;">';
                    tableHtml += '<thead><tr>';
                    tableHtml += '<th style="background:#f8f8f8;border:1px solid #eaeaea;padding:8px 10px;text-align:left;font-weight:600;">Field</th>';
                    data.rows.forEach((_, idx) => {
                        tableHtml += `<th style=\"background:#f8f8f8;border:1px solid #eaeaea;padding:8px 10px;text-align:left;font-weight:600;\">Record ${idx+1}</th>`;
                    });
                    tableHtml += '</tr></thead><tbody>';
                    data.columns.forEach((col, colIdx) => {
                        const rowStyle = colIdx % 2 === 0 ? 'background:#fff;' : 'background:#fafbfc;';
                        tableHtml += `<tr style=\"${rowStyle}\"><td style=\"border:1px solid #eaeaea;padding:8px 10px;font-weight:600;\">${col}</td>`;
                        data.rows.forEach(row => {
                            tableHtml += `<td style=\"border:1px solid #eaeaea;padding:8px 10px;\">${row[colIdx] !== null ? row[colIdx] : ''}</td>`;
                        });
                        tableHtml += '</tr>';
                    });
                    tableHtml += '</tbody></table></div>';
                    fundTableContainer.innerHTML = tableHtml;
                }
            } else {
                fundTableContainer.innerHTML = '<div>Unexpected response from server.</div>';
            }
            fundTableSection.style.display = 'block';
        } catch (err) {
            fundTableContainer.innerHTML = `<div class=\"error\">${err.message}</div>`;
        }
    }

    function getFundCurrentSelections() {
        const server = document.getElementById('fund-server-select').value;
        const database = document.getElementById('fund-database-select').value;
        const cusip = document.getElementById('fund-cusip-id').value.trim();
        const parentCompanyCode = document.getElementById('fund-parent-company-code').value.trim();
        return { server, database, cusip, parentCompanyCode };
    }

    fundViewRowsBtn && fundViewRowsBtn.addEventListener('click', () => {
        const { server, database, cusip, parentCompanyCode } = getFundCurrentSelections();
        if (!server || !database || !cusip || !parentCompanyCode) {
            alert('Please select server, database, and enter a CUSIP and parent company code.');
            return;
        }
        lastFundTableRequest = { server, database, cusip, parentCompanyCode };
        fetchAndRenderFundTable(server, database, cusip, parentCompanyCode);
    });

    fundReloadTableBtn && fundReloadTableBtn.addEventListener('click', () => {
        if (lastFundTableRequest) {
            fetchAndRenderFundTable(lastFundTableRequest.server, lastFundTableRequest.database, lastFundTableRequest.cusip, lastFundTableRequest.parentCompanyCode);
        } else {
            alert('No table to reload. Please view current rows first.');
        }
    });
} 