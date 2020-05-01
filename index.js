const inquirer = require('inquirer');

const {info, error} = require('./lib/console');

const {loadWorklogs, newWorklog, listToSend} = require('./lib/worklogs');

const init = async () => {
  info('Initializing...');
  await loadWorklogs();
};

const menu = async choices => {
  const prompt = inquirer.createPromptModule();
  try {
    const {option} = await prompt({
      type: 'list',
      message: 'Select an action',
      name: 'option',
      choices,
    });
    return option;
  } catch (err) {
    error(err);
  }
};

const main = async () => {
  const choices = [
    {
      label: 'Fill this month',
      fn: () => {},
    },
    {
      label: 'Create new',
      fn: newWorklog,
    },
    {
      label: 'Recurrent task',
      fn: () => {},
    },
    {
      label: 'List worklogs to send',
      fn: listToSend,
    },
    {
      label: 'Send worklogs',
      fn: () => {},
    },
    {
      label: 'Exit',
    },
  ];
  await init();

  while (true) {
    const option = await menu(choices.map(c => c.label));
    if (option === 'Exit') break;
    console.clear();
    await choices.find(c => c.label === option).fn();
  }
};

main();
