import { initSidebarResizer } from './sidebar_resizer.js';
import { initSectionSwitcher } from './section_switcher.js';
import { initSqlDisplay } from './sql_display.js';
import { initFileUpload } from './file_upload.js';
import { initAmendContract } from './amend_contract.js';
import { initUpdateStatus } from './update_status.js';
import { initGlpUpdate } from './glp_update.js';
import { initEpdUpdate } from './epd_update.js';
import { initFundNameChange } from './fund_name_change.js';
import { initSqlExecution, initSharedSqlExecution } from './sql_runner.js';

async function populateDropdowns() {
    try {
        const response = await fetch('/dropdown-config');
        const config = await response.json();
        const serverDropdowns = document.querySelectorAll('select[id$="-server-select"], select#server-select');
        const databaseDropdowns = document.querySelectorAll('select[id$="-database-select"], select#database-select');
        serverDropdowns.forEach(dropdown => {
            dropdown.innerHTML = '';
            config.servers.forEach(server => {
                const opt = document.createElement('option');
                opt.value = server;
                opt.textContent = server;
                dropdown.appendChild(opt);
            });
        });
        databaseDropdowns.forEach(dropdown => {
            dropdown.innerHTML = '';
            config.databases.forEach(db => {
                const opt = document.createElement('option');
                opt.value = db;
                opt.textContent = db;
                dropdown.appendChild(opt);
            });
        });
    } catch (err) {
        console.error('Failed to load dropdown config:', err);
    }
}

// Initialize all modules
document.addEventListener('DOMContentLoaded', async () => {
    await populateDropdowns();
    initSidebarResizer();
    initSectionSwitcher();
    initFileUpload();

    // Initialize form-specific logic
    initAmendContract();
    initUpdateStatus();
    initGlpUpdate();
    initEpdUpdate();
    initFundNameChange();
    initSqlDisplay(); // For the section with shared/generic IDs

    // Initialize the "Run SQL" functionality for each section
    initSqlExecution('amend');
    initSqlExecution('status');
    initSqlExecution('glp');
    initSqlExecution('epd');
    initSqlExecution('fund');
    initSharedSqlExecution(); // For the section with shared/generic IDs
});