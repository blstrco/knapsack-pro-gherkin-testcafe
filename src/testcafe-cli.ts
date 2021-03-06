const minimist = require('minimist');

// https://jestjs.io/docs/en/cli#options
export class TestcafeCLI {
  public static argvToOptions(): object {
    const argv = process.argv.slice(2);

    return minimist(argv);
  }
}
