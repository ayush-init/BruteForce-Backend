import { Project, SyntaxKind, CatchClause } from 'ts-morph';
import * as path from 'path';

const project = new Project({
  tsConfigFilePath: "../dsa-tracker-frontend/tsconfig.json",
});

console.log("Starting frontend catch block refactor...");

const frontendFiles = project.getSourceFiles();

let totalFixed = 0;

for (const file of frontendFiles) {
  let changed = false;
  
  // Skip modifying handleError itself or api.ts which handles its own things
  if (file.getBaseName() === "handleError.ts" || file.getBaseName() === "api.ts") {
    continue;
  }

  file.getDescendantsOfKind(SyntaxKind.CatchClause).forEach((catchClause: CatchClause) => {
    const block = catchClause.getBlock();
    const varName = catchClause.getVariableDeclaration()?.getName();
    if (!varName) return;
    
    const blockText = block.getText();
    // Replaces raw console.error or missing error handling with handleError
    if (!blockText.includes("handleError(")) {
      block.insertStatements(0, `handleError(${varName});`);
      changed = true;
    }
  });

  if (changed) {
    const hasImport = file.getImportDeclaration(decl => decl.getModuleSpecifierValue().includes('handleError'));
    if (!hasImport) {
      file.addImportDeclaration({
        namedImports: ['handleError'],
        moduleSpecifier: '@/utils/handleError'
      });
    }
    file.saveSync();
    console.log(`Updated ${file.getBaseName()}`);
    totalFixed++;
  }
}

console.log(`Refactored ${totalFixed} frontend files`);
