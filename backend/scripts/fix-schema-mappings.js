#!/usr/bin/env node

/**
 * Schema Mapping Fix Script
 * 
 * This script automatically fixes missing @map directives in the Prisma schema
 * to follow the KitchenSync naming conventions.
 */

const fs = require('fs');
const path = require('path');
const { parseSchema, validateMappings } = require('./validate-schema-mappings');

const SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');

// Convert camelCase to snake_case
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Convert PascalCase to snake_case plural
function pascalToSnakePlural(str) {
  const snake = str.replace(/[A-Z]/g, (letter, index) => 
    index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`
  );
  
  // Simple pluralization rules
  if (snake.endsWith('y')) {
    return snake.slice(0, -1) + 'ies';
  } else if (snake.endsWith('s') || snake.endsWith('sh') || snake.endsWith('ch')) {
    return snake + 'es';
  } else {
    return snake + 's';
  }
}

// Fix field mappings in a model
function fixFieldMappings(modelBody, issues) {
  let fixedBody = modelBody;
  
  // Sort issues by field name to ensure consistent ordering
  const fieldIssues = issues
    .filter(issue => issue.type === 'missing_field_map')
    .sort((a, b) => a.field.localeCompare(b.field));
  
  fieldIssues.forEach(issue => {
    const fieldName = issue.field;
    const expectedMapping = `@map("${camelToSnake(fieldName)}")`;
    
    // Find the field line and add the mapping
    const fieldRegex = new RegExp(`(\\s*${fieldName}\\s+[^\\s@\\n]+(?:\\s+@[^@\\n]*)*)(\\s*(?:\\n|$))`, 'g');
    
    fixedBody = fixedBody.replace(fieldRegex, (match, fieldDef, ending) => {
      // Check if @map already exists (shouldn't happen for missing_field_map issues)
      if (fieldDef.includes('@map(')) {
        return match;
      }
      
      // Add the @map directive
      return `${fieldDef} ${expectedMapping}${ending}`;
    });
  });
  
  return fixedBody;
}

// Fix table mapping for a model
function fixTableMapping(modelBody, modelName, issues) {
  let fixedBody = modelBody;
  
  const tableIssue = issues.find(issue => 
    issue.type === 'missing_table_map' && issue.model === modelName
  );
  
  if (tableIssue) {
    const expectedMapping = `@@map("${pascalToSnakePlural(modelName)}")`;
    
    // Add @@map at the end of the model, before the closing brace
    // Find the last line that's not just whitespace
    const lines = fixedBody.split('\n');
    let insertIndex = lines.length - 1;
    
    // Find the last non-empty line
    while (insertIndex > 0 && lines[insertIndex].trim() === '') {
      insertIndex--;
    }
    
    // Insert the @@map directive
    lines.splice(insertIndex + 1, 0, `  ${expectedMapping}`);
    fixedBody = lines.join('\n');
  }
  
  return fixedBody;
}

// Apply fixes to the schema
function applyFixes(schemaContent, models, issues) {
  let fixedSchema = schemaContent;
  
  // Group issues by model
  const issuesByModel = {};
  issues.forEach(issue => {
    if (!issuesByModel[issue.model]) {
      issuesByModel[issue.model] = [];
    }
    issuesByModel[issue.model].push(issue);
  });
  
  // Fix each model
  models.forEach(model => {
    const modelIssues = issuesByModel[model.name] || [];
    if (modelIssues.length === 0) return;
    
    console.log(`🔧 Fixing ${modelIssues.length} issues in model ${model.name}`);
    
    // Create the model regex to find and replace the entire model
    const modelRegex = new RegExp(
      `(model\\s+${model.name}\\s*{)([^}]+)(})`,
      'g'
    );
    
    fixedSchema = fixedSchema.replace(modelRegex, (match, modelStart, modelBody, modelEnd) => {
      let fixedBody = modelBody;
      
      // Fix field mappings
      fixedBody = fixFieldMappings(fixedBody, modelIssues);
      
      // Fix table mapping
      fixedBody = fixTableMapping(fixedBody, model.name, modelIssues);
      
      return `${modelStart}${fixedBody}${modelEnd}`;
    });
  });
  
  return fixedSchema;
}

// Create backup of original schema
function createBackup() {
  const backupPath = `${SCHEMA_PATH}.backup.${Date.now()}`;
  fs.copyFileSync(SCHEMA_PATH, backupPath);
  console.log(`📁 Created backup: ${backupPath}`);
  return backupPath;
}

// Main fix function
function fixSchema() {
  console.log('🔧 Fixing Prisma Schema Mappings...\n');
  
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(`❌ Schema file not found: ${SCHEMA_PATH}`);
    process.exit(1);
  }
  
  // Read and parse schema
  const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const models = parseSchema(schemaContent);
  const issues = validateMappings(models);
  
  // Filter only the issues we can automatically fix
  const fixableIssues = issues.filter(issue => 
    issue.type === 'missing_field_map' || issue.type === 'missing_table_map'
  );
  
  if (fixableIssues.length === 0) {
    console.log('✅ No fixable issues found!');
    return;
  }
  
  console.log(`📊 Found ${fixableIssues.length} fixable issues out of ${issues.length} total issues`);
  
  // Create backup
  const backupPath = createBackup();
  
  try {
    // Apply fixes
    const fixedSchema = applyFixes(schemaContent, models, fixableIssues);
    
    // Write fixed schema
    fs.writeFileSync(SCHEMA_PATH, fixedSchema);
    console.log(`✅ Applied fixes to ${SCHEMA_PATH}`);
    
    // Validate the fixed schema
    console.log('\n🔍 Validating fixed schema...');
    const fixedModels = parseSchema(fixedSchema);
    const remainingIssues = validateMappings(fixedModels);
    
    const remainingErrors = remainingIssues.filter(i => i.severity === 'error');
    const remainingWarnings = remainingIssues.filter(i => i.severity === 'warning');
    
    console.log(`📊 Remaining issues: ${remainingIssues.length} (${remainingErrors.length} errors, ${remainingWarnings.length} warnings)`);
    
    if (remainingErrors.length === 0) {
      console.log('🎉 All critical mapping issues have been fixed!');
      
      if (remainingWarnings.length > 0) {
        console.log('\n⚠️  Remaining warnings (manual review needed):');
        remainingWarnings.forEach(warning => {
          console.log(`   • ${warning.message}`);
        });
      }
      
      console.log('\n📋 Next steps:');
      console.log('   1. Run: npx prisma generate');
      console.log('   2. Run: npm run build:backend');
      console.log('   3. Test the application');
      console.log(`   4. If issues occur, restore from: ${backupPath}`);
      
    } else {
      console.log('\n❌ Some errors remain. Manual intervention required.');
      remainingErrors.forEach(error => {
        console.log(`   • ${error.message}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error applying fixes:', error.message);
    console.log(`🔄 Restoring from backup: ${backupPath}`);
    fs.copyFileSync(backupPath, SCHEMA_PATH);
    process.exit(1);
  }
}

// Run fix
if (require.main === module) {
  fixSchema();
}

module.exports = { fixSchema }; 