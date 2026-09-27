// GET /code/<kit path>, e.g. /code/part1/basic_api.py: one file from the course code
// kit as a plain-text download. Every file is generated at build time.
import { singleKitFiles } from '@/lib/courseKit';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return singleKitFiles().map((f) => ({ path: f.path.split('/') }));
}

export function GET(_request: Request, { params }: { params: { path: string[] } }) {
  const kitPath = params.path.map(decodeURIComponent).join('/');
  const file = singleKitFiles().find((f) => f.path === kitPath);
  if (!file) return new Response('Not found', { status: 404 });
  const fileName = kitPath.split('/').pop();
  return new Response(file.content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
