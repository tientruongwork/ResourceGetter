/**
 * copy resource from: https://gist.github.com/nerdyman/2f97b24ab826623bff9202750013f99e
 */

const path = require('path')

/**
 * Resolve tsconfig.json paths to Webpack aliases
 * @param  {string} tsconfigPath           - Path to tsconfig
 * @param  {string} webpackConfigBasePath  - Path from tsconfig to Webpack config to create absolute aliases
 * @return {object}                        - Webpack alias config
 */
function resolveTsconfigPathsToAlias(rootDir) {
    const tsconfigPath = path.join(rootDir, "tsconfig.json");

    const { paths } = require(tsconfigPath).compilerOptions;

    const aliases = {};

    Object.keys(paths).forEach((item) => {
        const key = item.replace('/*', '');
        const value = path.resolve(rootDir, paths[item][0].replace('/*', '').replace('*', ''));

        aliases[key] = value;
    });

    return aliases;
}

module.exports = resolveTsconfigPathsToAlias;