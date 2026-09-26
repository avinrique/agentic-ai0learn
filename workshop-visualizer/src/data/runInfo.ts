// What the "Run this yourself" box needs to know about one code lesson.
// The course code kit (downloadable zip) is built from these entries, so the file a
// student downloads is the program they just watched.
export interface RunInfo {
  lessonId: string;
  /** Path inside the course kit, e.g. 'part1/basic_api.py'. */
  fileName: string;
  /** The code shown in the lesson (exactly as displayed). */
  shownCode: string;
  /**
   * Only when the lesson shortened something (e.g. `{...}` for tool lists): the full,
   * runnable program. The download uses this; the box explains the difference.
   */
  runnableCode?: string;
  /** 1–2 sentences: what you should see when it runs. */
  expect: string;
  /** 2–3 small, safe changes to try, each one sentence. */
  tryThis: string[];
  /** The program asks the user to type something (input()). */
  needsInput?: boolean;
  /** Other kit files this program needs, e.g. 'part3/study_buddy_notes.txt'. */
  extraFiles?: string[];
}
