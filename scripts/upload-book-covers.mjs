import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const directory = process.env.BOOK_COVERS_DIR ?? 'artifacts/kutubi/public/book-covers';

if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before uploading covers.');

for (let index = 1; index <= 10; index += 1) {
  const filename = `image_${index}.jpg`;
  const body = await readFile(resolve(directory, filename));
  const response = await fetch(`${url}/storage/v1/object/book-images/catalog/${filename}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    },
    body,
  });
  if (!response.ok) throw new Error(`Could not upload ${filename}: ${response.status} ${await response.text()}`);
  console.log(`Uploaded ${filename}`);
}
