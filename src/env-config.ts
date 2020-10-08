export class EnvConfig {
  public static loadEnvironmentVariables(): void {
    if (process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_TESTCAFE) {
      process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN =
        process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_TESTCAFE;
    }
  }

  public static get testFilePattern(): string {
    if (process.env.KNAPSACK_PRO_TEST_FILE_PATTERN) {
      return process.env.KNAPSACK_PRO_TEST_FILE_PATTERN;
    }

    return '{**/?(*.).feature?(x),**/?(*.)(steps).ts?(x)}';
  }

  public static get testFileExcludePattern(): void | string {
    return process.env.KNAPSACK_PRO_TEST_FILE_EXCLUDE_PATTERN;
  }

  public static get coverageDirectory(): void | string {
    return process.env.KNAPSACK_PRO_COVERAGE_DIRECTORY;
  }
}
