# Tempo CLI

Tempo CLI for filling atlasian's tempo in a faster way

## Setup

Generate your `token` on tempo settings, check [here](https://tempo-io.github.io/tempo-api-docs/#worklogs) for detailed procces.

```sh

$ cp config.example.json config.json

```

Edit `config.json` adding your token there.

```sh

$ yarn install

$ yarn start

```

## Features

- You can add recurrent tasks (e.g. daily or forthnightly meetings) by chosing how often it happens and for how long (end date).

- Filling up a month will go through the whole days of the month and adding the task on the correct date.

- While adding a task on the month flow, you can copy the task from one of the latest 50 tasks you added on tempo.

> :warning: Due to tech limitations, you can only choose an issue from your previous tasks, but you can also freely type a code that is not listed

## License - MIT

Copyright 2020 - J.E. Kimura Reis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
