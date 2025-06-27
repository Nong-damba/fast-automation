import { initSidebarResizer } from './sidebar_resizer.js';
import { initSectionSwitcher } from './section_switcher.js';
import { initSqlDisplay } from './sql_display.js';
import { initFileUpload } from './file_upload.js';
import { initAmendContract } from './amend_contract.js';
import { initUpdateStatus } from './update_status.js';
import { initGlpUpdate } from './glp_update.js';
import { initEpdUpdate } from './epd_update.js';
import { initSqlExecution, initSharedSqlExecution } from './sql_runner.js';

// Initialize all modules
document.addEventListener('DOMContentLoaded', () => {
    initSidebarResizer();
    initSectionSwitcher();
    initFileUpload();

    // Initialize form-specific logic
    initAmendContract();
    initUpdateStatus();
    initGlpUpdate();
    initEpdUpdate();
    initSqlDisplay(); // For the section with shared/generic IDs

    // Initialize the "Run SQL" functionality for each section
    initSqlExecution('amend');
    initSqlExecution('status');
    initSqlExecution('glp');
    initSqlExecution('epd');
    initSharedSqlExecution(); // For the section with shared/generic IDs
});