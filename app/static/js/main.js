import { initFileUpload } from './file_upload.js';
import { initSqlDisplay } from './sql_display.js';
import { initSectionSwitcher } from './section_switcher.js';
import { initAmendContract } from './amend_contract.js';
import { initUpdateStatus } from './update_status.js';
import { initGlpUpdate } from './glp_update.js';
import { initEpdUpdate } from './epd_update.js';
import { initSidebarResizer } from './sidebar_resizer.js';

// Initialize all modules
document.addEventListener('DOMContentLoaded', () => {
    initFileUpload();
    initSqlDisplay();
    initSectionSwitcher();
    initAmendContract();
    initUpdateStatus();
    initGlpUpdate();
    initEpdUpdate();
    initSidebarResizer();
});