const fs = require('fs');
const path = require('path');
const yaml = require('./vendor/js-yaml.min.js');

class Hydrator {
  constructor(configPath) {
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    this.profilesDir = path.join(path.dirname(configPath), this.config.settings.paths.profiles);
  }

  loadYaml(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  }

  resolveProfile(profileName, profiles = {}) {
    const profilePath = path.join(this.profilesDir, `${profileName.toLowerCase()}.yaml`);
    const commonPath = path.join(this.profilesDir, 'common', `${profileName.toLowerCase()}.yaml`);
    
    let actualPath = fs.existsSync(profilePath) ? profilePath : (fs.existsSync(commonPath) ? commonPath : null);
    
    if (!actualPath) {
      console.error(`Profile not found: ${profileName}`);
      return profiles;
    }

    const data = this.loadYaml(actualPath);
    const key = Object.keys(data)[0];
    const profileData = data[key];

    if (profileData.relations) {
      const inherits = profileData.relations.filter(r => r.type === 'inherits').map(r => r.target);
      inherits.forEach(parent => this.resolveProfile(parent, profiles));
    }

    profiles[key] = profileData;
    return profiles;
  }

  substituteVariables(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/{{settings\.version}}/g, this.config.settings.version);
  }

  processData(data) {
    if (Array.isArray(data)) {
      return data.map(item => this.processData(item));
    } else if (typeof data === 'object' && data !== null) {
      const result = {};
      for (const [key, value] of Object.entries(data)) {
        if (key === 'relations') continue;
        result[key] = this.processData(value);
      }
      return result;
    }
    return this.substituteVariables(data);
  }

  hydrate() {
    const profiles = this.resolveProfile(this.config.settings.profile);
    return this.processData(profiles);
  }
}

module.exports = Hydrator;
