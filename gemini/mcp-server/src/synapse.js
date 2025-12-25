const fs = require('fs');
const path = require('path');
const yaml = require('./vendor/js-yaml.min.js');

class Synapse {
  constructor(configPath, rootDir) {
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    // Resolve profiles relative to the Project Root provided by the Cortex
    this.profilesDir = path.join(rootDir, this.config.settings.paths.profiles);
    this.profileCache = new Map();
  }

  loadYaml(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  }

  resolvePath(profileName) {
    const domainPath = path.join(this.profilesDir, `${profileName.toLowerCase()}.yaml`);
    const commonPath = path.join(this.profilesDir, 'common', `${profileName.toLowerCase()}.yaml`);
    
    // Debug logging
    // console.log(`[Synapse Debug] Looking for '${profileName}' at:`);
    // console.log(`  Domain: ${domainPath}`);
    // console.log(`  Common: ${commonPath}`);

    return fs.existsSync(domainPath) ? domainPath : (fs.existsSync(commonPath) ? commonPath : null);
  }

  /**
   * Builds the full inheritance chain as a list of Profile Objects.
   * This preserves the hierarchy/order (e.g., [DEVELOPER, ENGINEER, COLLABORATION, MONITORING]).
   */
  buildInheritanceChain(profileName, chain = []) {
    if (chain.some(p => Object.keys(p)[0] === profileName)) {
      return chain; // Cycle detection or already visited
    }

    const filePath = this.resolvePath(profileName);
    if (!filePath) {
      console.error(`[Synapse] Warning: Profile '${profileName}' not found.`);
      return chain;
    }

    const data = this.loadYaml(filePath);
    const key = Object.keys(data)[0]; // e.g., "DEVELOPER"
    const profileData = data[key];

    // Add current profile to chain (Depth-First Pre-order? Or Post-order?)
    // We want the "Child" (most specific) first in the list for overrides.
    chain.push({ [key]: profileData });

    if (profileData.relations) {
      const inherits = profileData.relations.filter(r => r.type === 'inherits').map(r => r.target);
      inherits.forEach(parent => this.buildInheritanceChain(parent, chain));
    }

    return chain;
  }

  /**
   * Flattens the chain into a "Memory Graph" for the LLM to read.
   * But keeps the metadata about where each observation came from.
   */
  synthesizeMemory(profileName) {
    const chain = this.buildInheritanceChain(profileName);
    
    // We want to return a structure that looks like the "Hydrated" memory,
    // but constructed dynamically.
    // The previous hydrator flattened everything. 
    // Here we can be smarter if needed, but for now, let's replicate the structure 
    // ensuring the order is correct.
    
    const combined = {};
    
    // Reverse the chain so parents are applied first, then children override/append.
    // Actually, for "Observations", we usually want the UNION of all of them.
    // The upstream code merges them.
    
    [...chain].reverse().forEach(profileObj => {
        const name = Object.keys(profileObj)[0];
        const data = profileObj[name];
        combined[name] = this.processData(data);
    });

    return combined;
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
}

module.exports = Synapse;
