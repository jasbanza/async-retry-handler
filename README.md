# Async Retry Handler

Retry an asynchronous operation with customizable retry options.

## Installation

You can install this package via npm:

```bash
npm install async-retry-handler
```

## Usage

Import the `asyncRetryHandler` function and use it to retry asynchronous operations with custom retry options.

### Example:

```js
import asyncRetryHandler from "async-retry-handler";

// Define your asynchronous operation function (e.g., runCommand)
async function runCommand(commandArgs) {
  // Implement your asynchronous operation here
  // ...
}

// Define success criteria, onSuccess, and onFailure functions
function successCriteria(response) {
  // Implement your success criteria here
  if (response && response.stdout) {
    const parsedResponse = JSON.parse(response.stdout);
    // Check if the response is an object with pool information
    if (
      parsedResponse &&
      typeof parsedResponse === "object" &&
      parsedResponse.pool
    ) {
      return true;
    }
  }
  return false;
}

function onSuccess(response) {
  // Handle success here
  console.log("Operation succeeded:", response);
  return JSON.parse(response.stdout).pool;
}

function onFailure(error) {
  // Handle failure here
  console.error("Operation failed:", error);
}

// Use the asyncRetryHandler to retry the operation with custom options
const response = asyncRetryHandler({
  operationFunction: runCommand,
  operationFunctionArgs: [`osmosisd q poolmanager pool ${poolId}`],
  maxRetries: 10,
  minTimeout: 300,
  maxTimeout: 2000,
  maxRetryTime: 10 * 1000,
  successCriteria,
  onSuccess,
  onFailure,
});

// Handle the response as needed
```

## Options

The `asyncRetryHandler` function accepts the following options:

- `operationFunction`: The asynchronous operation function to retry.
- `operationFunctionArgs`: The arguments for the operation function.
- `maxRetries` (optional): The maximum number of retry attempts (default: 10).
- `minTimeout` (optional): The minimum time in milliseconds between retry attempts (default: 300).
- `maxTimeout` (optional): The maximum time in milliseconds between retry attempts (default: 2000).
- `maxRetryTime` (optional): The maximum time in milliseconds for all retry attempts combined (default: 10000).
- `successCriteria`: A function that determines if the operation response was successful. It must return a boolean based on your success criteria.
- `onSuccess` (optional): A callback function to be called if the operation succeeds.
- `onFailure` (optional): A callback function to be called if the operation fails after all retries.
- `factor` (optional): The factor by which the timeout between retries is multiplied (default: 1).
- `randomize` (optional): If true, randomizes the timeout between retries (default: false).
- `debug` (optional): If true, logs retry attempts for debugging (default: false).

## Contributing

If you find any issues or have suggestions for improvements, please feel free to open an issue or create a pull request in the [GitHub repository](https://github.com/jasbanza/async-retry-handler).


## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/jasbanza/async-retry-handler/blob/main/LICENSE) file for details.
