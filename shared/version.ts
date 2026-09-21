/*
 * The product's version, as a module rather than as a read of `package.json`.
 *
 * Both are true copies of one number and that is a duplication — deliberately, because the
 * alternatives are worse here. Importing `package.json` from server code broke the deployed API
 * outright: the function bundle does not include it, so the import threw on every request. Reading
 * it from disk at runtime is the same problem with more steps, and deriving it from a git tag fails
 * on a shallow clone, which is what a deployment is.
 *
 * `npm run deploy:check` compares this with `package.json` and fails the build when they drift, so
 * the copy cannot go stale quietly.
 */
export const VERSION = '2.2.0';
