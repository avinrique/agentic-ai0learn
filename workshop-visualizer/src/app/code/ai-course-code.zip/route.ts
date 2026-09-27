// GET /code/ai-course-code.zip: the whole course code kit (every lesson program plus
// README, run.py, check_setup.py, ...) in one zip. Built once at build time.
import { strToU8, zipSync } from 'fflate';
import { courseKitFiles } from '@/lib/courseKit';
import { KIT_FOLDER } from '@/lib/kitUrls';

export const dynamic = 'force-static';

export function GET() {
  const entries = Object.fromEntries(courseKitFiles().map((f) => [`${KIT_FOLDER}/${f.path}`, strToU8(f.content)]));
  const zip = zipSync(entries, { level: 9 });
  return new Response(new Blob([zip as Uint8Array<ArrayBuffer>]), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="ai-course-code.zip"',
    },
  });
}
