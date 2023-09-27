import retry from "retry";

/**
 * Retry an asynchronous operation with customizable retry options.
 *
 * @param {Object} options - The retry options.
 * @param {Function} options.operationFunction - The asynchronous operation function to retry.
 * @param {Array} options.operationFunctionArgs - The arguments for the operation function.
 * @param {number} [options.maxRetries=10] - The maximum number of retry attempts. Defaults to 10.
 * @param {number} [options.minTimeout=500] - The minimum time in milliseconds between retry attempts. Defaults to 500.
 * @param {number} [options.maxTimeout=10000] - The maximum time in milliseconds between retry attempts. Defaults to 10000 (10 seconds).
 * @param {number} [options.maxRetryTime=60000] - The maximum time in milliseconds for all retry attempts combined. Defaults to 60000 (60 seconds).
 * @param {Function} options.successCriteria - A function that determines if the operation response was successful. It must return a boolean based on your success criteria.
 * @param {Function} [options.parseResult] - A function to parse the result before resolving it.
 * @param {Function} [options.onSuccess] - A callback function to be called if the operation succeeds.
 * @param {Function} [options.onFailure] - A callback function to be called if the operation fails after all retries.
 * @param {number} [options.factor=1] - The factor by which the timeout between retries is multiplied. Defaults to 1.
 * @param {boolean} [options.randomize=false] - If true, randomizes the timeout between retries. Defaults to false.
 * @param {boolean} [options.debug=false] - If true, log debugging information.
 * @returns {Promise} A Promise that resolves with the result of the successful operation or rejects with an error.
 */
async function asyncRetryHandler({
  operationFunction,
  operationFunctionArgs,
  maxRetries = 10,
  minTimeout = 500,
  maxTimeout = 10000,
  maxRetryTime = 60000,
  successCriteria,
  parseResult = null,
  onSuccess = null,
  onFailure = null,
  factor = 1,
  randomize = false,
  debug = false,
}) {
  const operation = retry.operation({
    retries: maxRetries,
    minTimeout,
    maxTimeout,
    maxRetryTime,
    factor,
    randomize,
  });

  return new Promise((resolve, reject) => {
    operation.attempt(async (currentAttempt) => {
      try {
        let result = await operationFunction(...operationFunctionArgs);

        if (successCriteria(result)) {
          // If success criteria met

          if (parseResult) {
            result = parseResult(result);
          }
          if (onSuccess) {
            onSuccess(result);
          }
          resolve(result);
        } else {
          // If success criteria not met
          if (operation.retry()) {
            // Retry the operation
            if (debug) {
              console.log(
                `Retrying operation: ${
                  operationFunction.name || "Anonymous Function"
                } (Attempt ${currentAttempt})`
              );
            }
            return;
          }
          const error = new Error(
            `Operation ${
              operationFunction.name || "Anonymous Function"
            } failed after ${maxRetries} retries.`
          );
          error.result = result;
          if (onFailure) {
            onFailure(error);
          }
          reject(error);
        }
      } catch (error) {
        if (operation.retry(error)) {
          // Retry the operation
          if (debug) {
            console.log(
              `Retrying operation: ${
                operationFunction.name || "Anonymous Function"
              } (Attempt ${currentAttempt})`
            );
          }
          return;
        }
        if (onFailure) {
          onFailure(error);
        }
        // No more retries, reject with the last error
        reject(error);
      }
    });
  });
}

export default asyncRetryHandler;
