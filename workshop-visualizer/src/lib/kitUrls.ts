// Where the course code kit is served (see src/app/code/). Safe to import in the browser.

/** The folder name inside the zip. */
export const KIT_FOLDER = 'ai-course';

/** The whole kit as one zip. */
export const KIT_ZIP_URL = '/code/ai-course-code.zip';

/** One file from the kit, e.g. kitFileUrl('part1/basic_api.py'). */
export const kitFileUrl = (kitPath: string) => `/code/${kitPath}`;
