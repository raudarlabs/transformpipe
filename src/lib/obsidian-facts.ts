/*
 * Where the Obsidian plugin is, in one place: the page that sells it and the prerendered copy a
 * crawler reads both link here, and a listing that moved would otherwise have to be found twice.
 */

/** The plugin's id in Obsidian's community directory, and in the vault's plugin folder. */
export const OBSIDIAN_PLUGIN_ID = 'transformpipe';

/**
 * Opens Obsidian on the plugin's page in Community plugins, where Install is one click. It only
 * does anything on a machine with Obsidian; the directory link beside it is for everybody else.
 */
export const OBSIDIAN_INSTALL = `obsidian://show-plugin?id=${OBSIDIAN_PLUGIN_ID}`;

/** The listing in the community directory, since 5 October 2026. */
export const OBSIDIAN_DIRECTORY = `https://community.obsidian.md/plugins/${OBSIDIAN_PLUGIN_ID}`;

export const OBSIDIAN_SOURCE = 'https://github.com/raudarlabs/transformpipe-obsidian';
