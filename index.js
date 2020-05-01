const prompt = require('prompt');

const { info, error } = require('./lib/console');
const { getWorklogs } = require('./lib/api.js');

const store = {
  worklogs: [],
  issues: new Set(),
};

const init = async () => {
  info('Initializing...');
  const { results } = await getWorklogs();
  store.worklogs = results;
  store.issues = new Set(results.map(wl => wl.issue.key));
  info(`Loaded latest worklogs(${results.length}) and issues (${store.issues.size})`);

  await setTimeout(() => {
    console.clear();
  }, 3000);
}

init();

while(true) {
  const {option} = await prompts({
    name: 'option',
    message: 
  });
}
