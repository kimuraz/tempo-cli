const chalk = require('chalk');

exports.info = text => console.log(chalk.blue(`[Info] - ${text}`));
exports.error = text => console.log(chalk.red(`[Error] - ${text}`));
