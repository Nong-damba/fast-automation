function showConfirmationModal(server, database, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'popup-modal';
    modal.innerHTML = `
        <div class="popup-content">
            <p>Run the code on <b>${server}</b> and <b>${database}</b>?</p>
            <div class="popup-actions">
                <button id="modal-confirm-run" class="action-btn run-btn">Run</button>
                <button id="modal-cancel-run" class="action-btn">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('modal-cancel-run').onclick = () => document.body.removeChild(modal);
    document.getElementById('modal-confirm-run').onclick = () => {
        document.body.removeChild(modal);
        onConfirm();
    };
}

async function executeSql(server, database, query, outputElement) {
    outputElement.style.display = 'block';
    outputElement.innerHTML = '<div class="log">Running...</div>';
    try {
        const response = await fetch('/run-sql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ server, database, query })
        });
        const data = await response.json();
        let outputHtml = '';
        if (data.logs) {
            outputHtml += data.logs.map(log => `<div class="log">${log}</div>`).join('');
        }
        // if (data.rows_affected !== null && data.rows_affected !== undefined) {
        //     outputHtml += `<div class="log"><b>Rows affected:</b> ${data.rows_affected}</div>`;
        // }
        if (data.error) {
            outputHtml += `<div class="log error"><b>Error:</b> ${data.error}</div>`;
        }
        outputElement.innerHTML = outputHtml;
    } catch (err) {
        outputElement.innerHTML = `<div class="log error">Error running code: ${err}</div>`;
    }
}

export function initSqlExecution(prefix) {
    const runBtn = document.getElementById(`${prefix}-run-btn`);
    if (!runBtn) return;

    const serverSelect = document.getElementById(`${prefix}-server-select`);
    const databaseSelect = document.getElementById(`${prefix}-database-select`);
    const sqlCode = document.getElementById(`${prefix}-sql-code`);
    const executionOutput = document.getElementById(`${prefix}-execution-output`);

    runBtn.addEventListener('click', () => {
        const server = serverSelect.value;
        const database = databaseSelect.value;
        const query = sqlCode.textContent;

        showConfirmationModal(server, database, () => {
            executeSql(server, database, query, executionOutput);
        });
    });
}

export function initSharedSqlExecution() {
    initSqlExecution('sql'); 
    
    const runBtn = document.getElementById('run-btn');
    if (!runBtn) return;
    
    const serverSelect = document.getElementById('server-select');
    const databaseSelect = document.getElementById('database-select');
    const sqlCode = document.getElementById('sql-code');
    const executionOutput = document.getElementById('execution-output');

    runBtn.addEventListener('click', () => {
        const server = serverSelect.value;
        const database = databaseSelect.value;
        const query = sqlCode.textContent;

        showConfirmationModal(server, database, () => {
            executeSql(server, database, query, executionOutput);
        });
    });
} 