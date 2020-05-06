const dayjs = require('dayjs');
const inquirer = require('inquirer');

const {info, error} = require('./console');
const {getWorklogs, saveWorklogs} = require('./api.js');
const config = require('../config.json');

const store = {
  authorAccountId: '',
  toSend: [],
  issues: [],
  history: [],
};

const listToSend = async () => {
  info('List of worklogs that will be sent');
  console.table(
    store.toSend.map(w => [
      w.issueKey,
      w.description,
      w.startDate,
      `${w.timeSpentSeconds / 3600} h`,
    ]),
  );
};

exports.listToSend = listToSend;

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

const newWorklog = async (prefilled = {}, isCopy = false) => {
  let worklog = prefilled;
  const questions = [
    {
      type: 'list',
      name: 'issueKey',
      choices: [...store.issues, ...config.issues, 'New issue'],
      message: 'Issue code',
    },
    {
      type: 'input',
      message: 'Type issue code',
      when: answers => answers.issueKey === 'New issue',
      name: 'issueKey',
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
  isCopy && worklogsToAdd.push(worklog);

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
        if (curDate.isoWeekday() !== 7 && curDate.isoWeekday() !== 6) {
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
exports.newWorklog = newWorklog;

const parseHistory = h => {
  const issueKey = h.issue.key;
  const {description, timeSpentSeconds} = {...h};

  return {issueKey, description, timeSpentSeconds};
};

const fillUpMonth = async (curDate, month) => {
  if (!curDate) {
    curDate = dayjs().startOf('month');
    month = curDate.get('month');
  }
  if (month !== curDate.add(1, 'days').get('month')) return;

  if (curDate.isoWeekday() === 7 || curDate.isoWeekday() === 6) {
    await fillUpMonth(curDate.add(1, 'days'), month);
  } else {
    info(`Creating tempo for day ${curDate.format('YYYY-MM-DD ddd')} - `);
    const startDate = curDate.format('YYYY-MM-DD');
    const prompt = new inquirer.createPromptModule();
    const questions = [
      {type: 'confirm', name: 'isCopy', message: 'Copy from history?'},
      {
        type: 'list',
        name: 'copyFrom',
        message: 'Select from which to copy from',
        choices: store.history.map(h => JSON.stringify(parseHistory(h))),
        when: answers => answers.isCopy,
      },
      {type: 'confirm', name: 'skip', default: false, message: 'Skip day?', when: answers => !answers.isCopy},
    ];
    const {isCopy, copyFrom, skip} = await prompt(questions);
    if (skip) {
      await fillUpMonth(curDate.add(1, 'days'), month);
    }

    !isCopy && (await newWorklog({startDate}));

    if (isCopy) {
      const from = {...JSON.parse(copyFrom), startDate};
      await newWorklog({...from}, true);
    }

    const {next} = await prompt({
      type: 'confirm',
      message: 'Go to next day?',
      name: 'next',
    });

    if (next) {
      await fillUpMonth(curDate.add(1, 'days'), month);
    }
    !next && (await fillUpMonth(curDate, month));
  }
};

exports.fillUpMonth = fillUpMonth;

exports.sendWorklogs = async () => {
  try {
    store.toSend.forEach(async w => {
      await saveWorklogs(w);
    });
    store.toSend = [];
  } catch (err) {
    error(err.toString());
  }
};
