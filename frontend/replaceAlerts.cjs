const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/student/ProjectsPage.jsx',
  'src/pages/student/SharedProjectsPage.jsx',
  'src/pages/student/DashboardPage.jsx',
  'src/pages/student/AdviserRemarksPage.jsx',
  'src/pages/faculty/ValidatedArchivePage.jsx',
  'src/pages/faculty/ReviewQueuePage.jsx',
  'src/pages/faculty/OverviewPage.jsx',
  'src/pages/faculty/AdviseesPage.jsx',
  'src/pages/admin/UsersTenantsPage.jsx',
  'src/pages/admin/ContentManagementPage.jsx',
  'src/components/navigation/Sidebar.jsx'
];

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('alert(')) {
      content = content.replace(/alert\(/g, 'useToastStore.getState().addToast(');
      const importStmt = "import { useToastStore } from '@/store/useToastStore'\n";
      if (!content.includes('useToastStore')) {
        const parts = content.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < parts.length; i++) {
          if (parts[i].startsWith('import ')) {
            lastImportIndex = i;
          }
        }
        if (lastImportIndex !== -1) {
          parts.splice(lastImportIndex + 1, 0, importStmt);
        } else {
          parts.unshift(importStmt);
        }
        content = parts.join('\n');
      }
      fs.writeFileSync(fullPath, content);
      console.log('Updated', file);
    }
  }
});
