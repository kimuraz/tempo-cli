const dayjs = require('dayjs');
const inquirer = require('inquirer');

const {info, error} = require('./console');
const {getWorklogs} = require('./api.js');

const store = {
  authorAccountId: '',
  toSend: [],
  issues: [],
  history: [],
};

exports.listToSend = async () => {
  info('List of worklogs that will be sent');
  console.table(store.toSend.map(w => Object.values(w)));
};

exports.loadWorklogs = async () => {
  const {results} = await getWorklogs();

  if (!results.length) return;

  store.history = results;
  store.issues = new Set(results.map(wl => wl.issue.key));
  store.authorAccountId = results[0].author.accountId;

  info(
    `Loaded latest worklogs(${results.length}) and issues (${store.issues.size})`,
  );
};

exports.newWorklog = async (prefilled = {}, isCopy = false) => {
  let worklog = prefilled;
  const questions = [
    {
      type: 'list',
      name: 'issue',
      choices: [...store.issues, 'New issue'],
      message: 'Issue code',
    },
    {
      type: 'input',
      message: 'Type issue code',
      when: answers => answers.issue === 'New issue',
      name: 'issue',
    },
    {
      type: 'input',
      message: 'Description',
      name: 'description',
    },
    {
      type: 'input',
      name: 'startDate',
      message: 'Start Date (YYYY-MM-DD)',
      when: () => !prefilled.startDate,
    },
    {
      type: 'number',
      name: 'timeSpentSeconds',
      message: 'Time spent (in hours 0.5 = 30minutes, 1 = 1hours)',
    },
  ];
  const recurrentQuestions = [
    {
      type: 'number',
      name: 'recurrent',
      message: 'Repeat every (in days, 0 for not recurrent):',
      default: 0,
    },
    {
      type: 'input',
      name: 'recurrentUntil',
      message: 'Repeat until (date, YYYY-MM-DD)',
      when: answers => !!answers.recurrent,
    },
  ];
  const worklogsToAdd = [];

  if (!isCopy) {
    const prompt = new inquirer.createPromptModule();
    const worklogAttr = await prompt(questions);
    const {recurrent, recurrentUntil} = await prompt(recurrentQuestions);

    worklogAttr.timeSpentSeconds *= 3600;

    if (recurrent) {
      let curDate = dayjs(worklogAttr.startDate);
      const lastDate = dayjs(recurrentUntil);
      while (curDate.isBefore(lastDate.subtract(recurrent, 'days'))) {
        curDate = curDate.add(recurrent, 'days');
        if (curDate.day() !== 0 && curDate.day() !== 6) {
          info(`Copying to ${curDate.format('YYYY-MM-DD')}`);
          worklogsToAdd.push({
            ...worklogAttr,
            authorAccountId: store.authorAccountId,
            startDate: curDate.format('YYYY-MM-DD'),
          });
        }
      }
    }

    worklogsToAdd.push({
      ...worklogAttr,
      ...prefilled,
      authorAccountId: store.authorAccountId,
    });
  }

  info(`worklogsToAdd: ${worklogsToAdd.length}`);

  store.toSend.push(...worklogsToAdd);
};

exports.fillUpMonth = async () => {
  let curDate = dayjs().startOf('month');
};
