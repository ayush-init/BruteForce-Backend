import { Project, SyntaxKind, CatchClause } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

console.log("Starting catch block fix...");

// Refactor Controllers
const controllerFiles = project.getSourceFiles("src/controllers/**/*.ts");
for (const file of controllerFiles) {
  let changed = false;

  file.getDescendantsOfKind(SyntaxKind.CatchClause).forEach((catchClause: CatchClause) => {
    const block = catchClause.getBlock();
    const varName = catchClause.getVariableDeclaration()?.getName() || "error";
    
    // Check if we already inserted the fix
    const blockText = block.getText();
    if (!blockText.includes(`if (${varName} instanceof ApiError) throw ${varName};`)) {
      block.insertStatements(0, `if (${varName} instanceof ApiError) throw ${varName};`);
      changed = true;
    }
  });

  if (changed) {
    file.saveSync();
    console.log(`Fixed catch blocks in ${file.getBaseName()}`);
  }
}

console.log("Fix complete");
