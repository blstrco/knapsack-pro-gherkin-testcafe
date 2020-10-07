#!/usr/bin/env node

const { name: clientName, version: clientVersion } = require('../package.json');

const createTestCafe = require('gherkin-testcafe');
const { v4: uuidv4 } = require('uuid');

import {
  KnapsackProCore,
  KnapsackProLogger,
  onQueueFailureType,
  onQueueSuccessType,
  TestFile,
} from '@knapsack-pro/core';
import { EnvConfig } from './env-config';
import { TestFilesFinder } from './test-files-finder';
import { TestcafeCLI } from './testcafe-cli';

const testcafeCLIOptions = TestcafeCLI.argvToOptions();
const knapsackProLogger = new KnapsackProLogger();
knapsackProLogger.debug(
  `Testcafe CLI options:\n${KnapsackProLogger.objectInspect(TestcafeCLI)}`
);

EnvConfig.loadEnvironmentVariables();

const projectPath = process.cwd();
const allTestFiles: TestFile[] = TestFilesFinder.allTestFiles();
const knapsackPro = new KnapsackProCore(
  clientName,
  clientVersion,
  allTestFiles
);

const onSuccess: onQueueSuccessType = async (queueTestFiles: TestFile[]) => {
  const testFilePaths: string[] = queueTestFiles.map(
    (testFile: TestFile) => testFile.path
  );

  const testcafeRunner = async () => {
    const testcafe = await createTestCafe('localhost', 1337, 1338);
    const runner = await testcafe.createRunner();
    const remoteConnection = await testcafe.createBrowserConnection();

    return runner
      .src([...testFilePaths])
      .browsers([remoteConnection, 'chrome'])
      .run();
  };

  const {
    results: { success: isTestSuiteGreen, testResults },
  } = await testcafeRunner();

  const recordedTestFiles: TestFile[] = testResults.map(
    ({
      testFilePath,
      perfStats: { start, end },
    }: {
      testFilePath: string;
      perfStats: { start: number; end: number };
    }) => {
      const path =
        process.platform === 'win32'
          ? testFilePath.replace(`${projectPath}\\`, '').replace(/\\/g, '/')
          : testFilePath.replace(`${projectPath}/`, '');
      const timeExecutionMiliseconds = end - start;
      // 0.1s default time when not recorded timing
      const timeExecution =
        timeExecutionMiliseconds > 0 ? timeExecutionMiliseconds / 1000 : 0.1;

      return {
        path,
        time_execution: timeExecution,
      };
    }
  );

  return {
    recordedTestFiles,
    isTestSuiteGreen,
  };
};

// we do nothing when error so pass noop
const onError: onQueueFailureType = (error: any) => {};

knapsackPro.runQueueMode(onSuccess, onError);
