import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'entities.ftm.json');

const loadData = () => {
  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  return fileContent.split('\n')
    .filter(line => line.trim() !== '')
    .map(line => JSON.parse(line));
};

const entities = loadData();

export const searchPerson = async (name) => {
  return entities.filter(entity => 
    entity.schema === 'Person' && 
    (entity.properties.name.some(n => n.toLowerCase().includes(name.toLowerCase())) ||
     (entity.properties.alias && entity.properties.alias.some(a => a.toLowerCase().includes(name.toLowerCase()))))
  );
};

export const searchEntity = async (name, schema = null) => {
  return entities.filter(entity => {
    const nameMatch = entity.properties.name.some(n => n.toLowerCase().includes(name.toLowerCase())) ||
                      (entity.properties.alias && entity.properties.alias.some(a => a.toLowerCase().includes(name.toLowerCase())));
    return schema ? (entity.schema === schema && nameMatch) : nameMatch;
  });
};

export const getEntityTypes = () => {
  return [...new Set(entities.map(entity => entity.schema))];
};

export const getEntityDetails = (id) => {
  return entities.find(entity => entity.id === id);
};

export const searchByTopic = async (topic) => {
  return entities.filter(entity => 
    entity.properties.topics && entity.properties.topics.includes(topic)
  );
};

export const searchByCountry = async (country) => {
  return entities.filter(entity => 
    entity.properties.country && entity.properties.country.includes(country)
  );
};

export const getTopics = () => {
  const allTopics = entities.flatMap(entity => entity.properties.topics || []);
  return [...new Set(allTopics)];
};