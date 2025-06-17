#!/usr/bin/env node

/**
 * Schema Mapping Validation Script
 * 
 * This script validates that all Prisma models follow the KitchenSync naming conventions:
 * - All models have @@map directives
 * - All camelCase fields have @map directives to snake_case columns
 * - Foreign keys follow the {table}_id pattern
 */

const fs = require('fs');
const path = require('path');

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

// Check if field needs @map directive
function needsMapping(fieldName) {
  // Fields that are already snake_case don't need mapping
  if (fieldName === fieldName.toLowerCase() && fieldName.includes('_')) {
    return false;
  }
  
  // camelCase fields need mapping
  return /[A-Z]/.test(fieldName);
}

// Parse Prisma schema
function parseSchema(schemaContent) {
  const models = [];
  const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;
  
  let match;
  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];
    
    // Extract fields
    const fields = [];
    const fieldRegex = /^\s*(\w+)\s+([^\s@]+)(?:\s+@[^@\n]*)*(?:\s+@@[^@\n]*)*/gm;
    
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(modelBody)) !== null) {
      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2];
      
      // Skip relation fields (they don't map to columns)
      if (fieldType[0] === fieldType[0].toUpperCase() && !['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json'].includes(fieldType)) {
        continue;
      }
      
      fields.push({
        name: fieldName,
        type: fieldType,
        line: modelBody.substring(0, fieldMatch.index).split('\n').length
      });
    }
    
    // Check for @@map directive
    const tableMapMatch = modelBody.match(/@@map\("([^"]+)"\)/);
    const hasTableMap = !!tableMapMatch;
    const expectedTableName = pascalToSnakePlural(modelName);
    const actualTableName = tableMapMatch ? tableMapMatch[1] : null;
    
    models.push({
      name: modelName,
      fields,
      hasTableMap,
      expectedTableName,
      actualTableName,
      body: modelBody
    });
  }
  
  return models;
}

// Validate schema mappings
function validateMappings(models) {
  const issues = [];
  
  models.forEach(model => {
    // Check table mapping
    if (!model.hasTableMap) {
      issues.push({
        type: 'missing_table_map',
        model: model.name,
        message: `Model ${model.name} is missing @@map directive`,
        expected: `@@map("${model.expectedTableName}")`,
        severity: 'error'
      });
    } else if (model.actualTableName !== model.expectedTableName) {
      issues.push({
        type: 'incorrect_table_map',
        model: model.name,
        message: `Model ${model.name} has incorrect table mapping`,
        expected: `@@map("${model.expectedTableName}")`,
        actual: `@@map("${model.actualTableName}")`,
        severity: 'warning'
      });
    }
    
    // Check field mappings
    model.fields.forEach(field => {
      if (needsMapping(field.name)) {
        const expectedColumnName = camelToSnake(field.name);
        const mapRegex = new RegExp(`${field.name}\\s+[^@\\n]*@map\\("([^"]+)"\\)`);
        const mapMatch = model.body.match(mapRegex);
        
        if (!mapMatch) {
          issues.push({
            type: 'missing_field_map',
            model: model.name,
            field: field.name,
            message: `Field ${model.name}.${field.name} is missing @map directive`,
            expected: `@map("${expectedColumnName}")`,
            severity: 'error'
          });
        } else {
          const actualColumnName = mapMatch[1];
          if (actualColumnName !== expectedColumnName) {
            issues.push({
              type: 'incorrect_field_map',
              model: model.name,
              field: field.name,
              message: `Field ${model.name}.${field.name} has incorrect column mapping`,
              expected: `@map("${expectedColumnName}")`,
              actual: `@map("${actualColumnName}")`,
              severity: 'warning'
            });
          }
        }
      }
    });
  });
  
  return issues;
}

// Generate fix suggestions
function generateFixes(issues) {
  const fixes = [];
  
  issues.forEach(issue => {
    if (issue.type === 'missing_table_map') {
      fixes.push({
        model: issue.model,
        type: 'add_table_map',
        suggestion: `Add ${issue.expected} to the end of model ${issue.model}`
      });
    }
    
    if (issue.type === 'missing_field_map') {
      fixes.push({
        model: issue.model,
        field: issue.field,
        type: 'add_field_map',
        suggestion: `Add ${issue.expected} to field ${issue.field} in model ${issue.model}`
      });
    }
  });
  
  return fixes;
}

// Main validation function
function validateSchema() {
  console.log('🔍 Validating Prisma Schema Mappings...\n');
  
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(`❌ Schema file not found: ${SCHEMA_PATH}`);
    process.exit(1);
  }
  
  const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const models = parseSchema(schemaContent);
  const issues = validateMappings(models);
  
  console.log(`📊 Found ${models.length} models in schema`);
  console.log(`🔍 Identified ${issues.length} mapping issues\n`);
  
  if (issues.length === 0) {
    console.log('✅ All models follow the naming conventions!');
    return;
  }
  
  // Group issues by severity
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  
  if (errors.length > 0) {
    console.log(`❌ ERRORS (${errors.length}):`);
    errors.forEach(issue => {
      console.log(`   • ${issue.message}`);
      console.log(`     Expected: ${issue.expected}`);
      if (issue.actual) {
        console.log(`     Actual: ${issue.actual}`);
      }
      console.log();
    });
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach(issue => {
      console.log(`   • ${issue.message}`);
      console.log(`     Expected: ${issue.expected}`);
      console.log(`     Actual: ${issue.actual}`);
      console.log();
    });
  }
  
  // Generate fixes
  const fixes = generateFixes(issues);
  if (fixes.length > 0) {
    console.log('🔧 SUGGESTED FIXES:');
    fixes.forEach(fix => {
      console.log(`   • ${fix.suggestion}`);
    });
    console.log();
  }
  
  console.log('📖 See docs/NAMING_CONVENTIONS.md for complete guidelines');
  
  // Exit with error code if there are errors
  if (errors.length > 0) {
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  validateSchema();
}

module.exports = { validateSchema, parseSchema, validateMappings }; 