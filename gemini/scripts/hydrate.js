const fs = require('fs');
const path = require('path');
const yaml = require('./vendor/js-yaml.min.js');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));

function loadYaml(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

function resolveProfile(profileName, profiles = {}) {
  const profilePath = path.join(__dirname, '../profiles', `${profileName.toLowerCase()}.yaml`);
  const commonPath = path.join(__dirname, '../profiles/common', `${profileName.toLowerCase()}.yaml`);
  
  let actualPath = fs.existsSync(profilePath) ? profilePath : (fs.existsSync(commonPath) ? commonPath : null);
  
  if (!actualPath) {
    console.error(`Profile not found: ${profileName}`);
    return profiles;
  }

  const data = loadYaml(actualPath);
  const key = Object.keys(data)[0];
  const profileData = data[key];

  if (profileData.relations) {
    const inherits = profileData.relations.filter(r => r.type === 'inherits').map(r => r.target);
    inherits.forEach(parent => resolveProfile(parent, profiles));
  }

  profiles[key] = profileData;
  return profiles;
}

function substituteVariables(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/{{settings\.version}}/g, config.settings.version);
}

function processData(data) {
  if (Array.isArray(data)) {
    return data.map(item => processData(item));
  } else if (typeof data === 'object' && data !== null) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'relations') continue;
      result[key] = processData(value);
    }
    return result;
  }
  return substituteVariables(data);
}

function hydrateSkills(memoryData) {
  const skillsDir = path.join(__dirname, '../skills');
  const files = fs.readdirSync(skillsDir);

  files.forEach(file => {
    if (!file.endsWith('.md')) return;
    const filePath = path.join(skillsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const memoryPattern = /(<!-- framework-memory-start -->)[\s\S]*?(<!-- framework-memory-end -->)/;
    const jsonContent = JSON.stringify({ profiles: memoryData }, null, 2);
    const jsonBlock = "<!-- framework-memory-start -->\n```json\n" + jsonContent + "\n```\n<!-- framework-memory-end -->";
    
    if (memoryPattern.test(content)) {
      content = content.replace(memoryPattern, jsonBlock);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log("Hydrated " + file);
    } else {
      // If markers not found, append them
      content += "\n\n" + jsonBlock;
      fs.writeFileSync(filePath, content, 'utf8');
      console.log("Added memory and hydrated " + file);
    }
  });
}

const profiles = resolveProfile(config.settings.profile);
const processedProfiles = processData(profiles);
hydrateSkills(processedProfiles);
console.log("Hydration complete!");