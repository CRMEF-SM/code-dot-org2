import * as codeStudioLevels from './code-studio/levels/codeStudioLevels';
import { TestResults } from './constants';
import { valueOr } from './utils';

let pendingPost = false;
let callOnPostCompletion = null;

/**
 * Get results from contained level that we can use to post to the server. We
 * also potentially use this to craft feedback messages that the user will see
 * when they hit finish.
 */
export function getContainedLevelResultInfo() {
  const containedResult = codeStudioLevels.getContainedLevelResult();
  const levelResult = containedResult.result;
  const testResults = valueOr(containedResult.testResult,
    levelResult.result ? TestResults.ALL_PASS : TestResults.GENERIC_FAIL);
  return {
    app: containedResult.app,
    level: containedResult.id,
    callback: containedResult.callback,
    result: levelResult.result,
    testResults: testResults,
    program: levelResult.response,
    feedback: containedResult.feedback,
    // TODO - fully understand submitted
    submitted: false
  };
}

/**
 * Called when clicking run. If we have a contained level, we want to submit our
 * attempt to the server (so that on reload, we'll have the saved answer and
 * don't let the student submit again).
 * @param {boolean} hasContainedLevels - Do we actually have a contained level
 * @param {number} attempts - How many times we've clicked run for this level
 * @param {function} onAttempt - Callback provided to studioApp for when we submit
 8   contained level
 */
export function postContainedLevelAttempt({hasContainedLevels, attempts, onAttempt}) {
  if (!hasContainedLevels || attempts !== 1) {
    return;
  }

  // Track the fact that we're currently submitting
  pendingPost = true;

  const reportInfo = getContainedLevelResultInfo();
  onAttempt({
    ...reportInfo,
    onComplete() {
      // Finished submitting. If we scheduled a completion function during the
      // submission, call that now.
      pendingPost = false;
      if (callOnPostCompletion) {
        callOnPostCompletion();
        callOnPostCompletion = null;
      }
    }
  });
}

/**
 * Register a function to call after our post has completed. If our post already
 * happened, we can just call fn immediately
 * @param {function} fn - Method to call
 */
export function runAfterPostContainedLevel(fn) {
  if (!pendingPost) {
    fn();
  }
  callOnPostCompletion = fn;
}
