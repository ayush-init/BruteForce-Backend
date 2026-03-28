import { Project, SyntaxKind, ArrowFunction } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

console.log("Starting refactor...");

// 1. Refactor Services
const serviceFiles = project.getSourceFiles("src/services/**/*.ts");
for (const file of serviceFiles) {
  let changed = false;
  
  file.getDescendantsOfKind(SyntaxKind.ThrowStatement).forEach(throwStmt => {
    const errorExp = throwStmt.getExpression();
    if (errorExp && errorExp.getKind() === SyntaxKind.NewExpression) {
      const expStr = errorExp.getText();
      if (expStr.startsWith("new Error(")) {
        const argsStr = expStr.substring("new Error(".length, expStr.length - 1);
        throwStmt.setExpression(`new ApiError(400, ${argsStr})`);
        changed = true;
      }
    }
  });

  if (changed) {
    const hasImport = file.getImportDeclaration(decl => decl.getModuleSpecifierValue().includes('ApiError'));
    if (!hasImport) {
      file.addImportDeclaration({
        namedImports: ['ApiError'],
        moduleSpecifier: '../utils/ApiError'
      });
    }
    file.saveSync();
    console.log(`Updated ${file.getBaseName()}`);
  }
}

// 2. Refactor Controllers
const controllerFiles = project.getSourceFiles("src/controllers/**/*.ts");
for (const file of controllerFiles) {
  let changed = false;

  const hasAsyncHandlerImport = file.getImportDeclaration(decl => decl.getModuleSpecifierValue().includes('asyncHandler'));
  if (!hasAsyncHandlerImport) {
    file.addImportDeclaration({
      namedImports: ['asyncHandler'],
      moduleSpecifier: '../utils/asyncHandler'
    });
    changed = true;
  }
  const hasApiErrorImport = file.getImportDeclaration(decl => decl.getModuleSpecifierValue().includes('ApiError'));
  if (!hasApiErrorImport) {
    file.addImportDeclaration({
      namedImports: ['ApiError'],
      moduleSpecifier: '../utils/ApiError'
    });
    changed = true;
  }

  const varDecls = file.getVariableDeclarations();
  for (const varDecl of varDecls) {
    if (varDecl.hasExportKeyword() || varDecl.getFirstAncestorByKind(SyntaxKind.VariableStatement)?.hasExportKeyword()) {
      const initializer = varDecl.getInitializer();
      if (initializer && initializer.getKind() === SyntaxKind.ArrowFunction) {
        const arrowFunc = initializer as ArrowFunction;
        const text = arrowFunc.getText();
        
        // Wrap with asyncHandler if not already wrapped
        if (!text.startsWith("asyncHandler(")) {
          varDecl.setInitializer(`asyncHandler(${text})`);
          changed = true;
        }
      }
    }
  }

  // A simpler way for res.status is replacing the raw text so we can catch multiline formatting easily.
  let fullText = file.getFullText();
  
  // Replace: return res.status(XXX).json({ error: YYY }) => throw new ApiError(XXX, YYY)
  const regex = /return\s+res\.status\((\d+)\)\.json\(\s*\{\s*error:\s*(.+?)\s*\}\s*\);?/g;
  if(regex.test(fullText)) {
      fullText = fullText.replace(regex, "throw new ApiError($1, $2);");
      changed = true;
  }

  // Replace res.status(500).json({ error: 'Failed to ...' })
  // Often it's just res.status(500).json({ error: ... }) without return inside catch blocks
  const regex2 = /res\.status\((\d+)\)\.json\(\s*\{\s*error:\s*(.+?)\s*\}\s*\);?/g;
  if(regex2.test(fullText)) {
      fullText = fullText.replace(regex2, "throw new ApiError($1, $2);");
      changed = true;
  }

  if (changed) {
    file.replaceWithText(fullText);
    file.saveSync();
    console.log(`Updated ${file.getBaseName()}`);
  }
}

console.log("Refactoring complete");
