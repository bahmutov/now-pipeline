# now-pipeline

> Single CI command to deploy new code to Zeit Now
> Includes e2e tests and the alias switch

[![NPM][npm-icon] ][npm-url]

[![Build status][ci-image] ][ci-url]
[![semantic-release][semantic-image] ][semantic-url]
[![js-standard-style][standard-image]][standard-url]
[![first-timers-only](http://img.shields.io/badge/first--timers--only-friendly-blue.svg)](https://github.com/bahmutov/now-pipeline/labels/first-timers-only)
[![next-update-travis badge][nut-badge]][nut-readme]

## First time contributors

This repo is [first time OSS contributor friendly](http://www.firsttimersonly.com/).
See [these issues](https://github.com/bahmutov/now-pipeline/labels/first-timers-only)
to contribute in meaningful way.

## What and why

I am [super excited](https://glebbahmutov.com/blog/think-inside-the-box/)
about [Zeit Now](https://zeit.co/now) tool; this is the "missing CI tool"
for it. A single command `now-pipeline`

- deploys new version
- tests it
- switches alias to the new deployment
- takes down the old deployment

Should be enough to automatically update the server or service running in
the cloud without breaking anything.

## Install and use

```sh
npm i -g now-pipeline
```

Set `NOW_TOKEN` CI environment variable with a token that you can get from
[Zeit account page](https://zeit.co/account#api-tokens)

Add CI command to `now-pipeline`. By default it will execute `npm test`
and will pass the deployed url as `NOW_URL` environment variable. You can
customize everything.

## Example

Simple Travis commands

```yml
script:
  # after unit tests
  - npm i -g now-pipeline
  - now-pipeline
```

Prune existing deploys (if they do not have an alias) and show the deploy.

```yml
script:
  - npm i -g now-pipeline
  - now-pipeline-prune
  - now-pipeline
  - now-pipeline-list
```

Set [domain alias](https://zeit.co/world) if there is no existing one

```yml
script:
  - npm i -g now-pipeline
  - now-pipeline --alias foo.domain.com
```

Pass in path to be used as deploy directory

```yml
script:
  - npm i -g now-pipeline
  - now-pipeline --dir your/directory
```

Pass test command and name of the environment variable for deployed url

```yml
script:
  - npm i -g now-pipeline
  - now-pipeline --as HOST --test "npm run e2e"
```

## Example projects

* [todomvc-express](https://github.com/bahmutov/todomvc-express/blob/master/.travis.yml)
* [express-sessions-tutorial](https://github.com/bahmutov/express-sessions-tutorial/blob/master/.travis.yml)
* [test-semantic-deploy-with-now](https://github.com/bahmutov/test-semantic-deploy-with-now)

## Additional bin commands

* `now-pipeline-list` - see the current deploys for the current project
* `now-pipeline-prune` - remove all non-aliased deploys for the current project

You can pass custom test command to the pipeline to be used after deploying
fresh install using `--test "command"` argument. The command will get `NOW_URL`
environment variable with new install. For example

```sh
npm i -g now-pipeline
now-pipeline --test "npm run prod-test"
```

where the `package.json` has

```json
{
  "scripts": {
    "prod-test": "e2e-test $NOW_URL"
  }
}
```

## Debugging

You can see verbose log messages by running this tool with environment variable `DEBUG=now-pipeline`

## Details

* `now-pipeline` uses [Zeit API](https://zeit.co/api) via [now-client](https://github.com/zeit/now-client).
* You can see the list of recent actions at [Zeit dashboard](https://zeit.co/dashboard).
* It discovers files to send using [pkgd](https://github.com/inikulin/pkgd),
  you can see the files by using the following command
  (read [Smaller published NPM modules](https://glebbahmutov.com/blog/smaller-published-NPM-modules/) for more details)
```sh
t="$(npm pack .)"; wc -c "${t}"; tar tvf "${t}"; rm "${t}"
```
* file `.npmignore` is considered an optional file

## Related

* [next-update](https://github.com/bahmutov/next-update) is a similar
  "if tests pass, upgrade" tool for your NPM dependencies.

### Small print

Author: Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt; &copy; 2016

* [@bahmutov](https://twitter.com/bahmutov)
* [glebbahmutov.com](http://glebbahmutov.com)
* [blog](http://glebbahmutov.com/blog)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/now-pipeline/issues) on Github

## MIT License

Copyright (c) 2016 Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

[npm-icon]: https://nodei.co/npm/now-pipeline.svg?downloads=true
[npm-url]: https://npmjs.org/package/now-pipeline
[ci-image]: https://travis-ci.org/bahmutov/now-pipeline.svg?branch=master
[ci-url]: https://travis-ci.org/bahmutov/now-pipeline
[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/
[nut-badge]: https://img.shields.io/badge/next--update--travis-ok-green.svg
[nut-readme]: https://github.com/bahmutov/next-update-travis#readme
