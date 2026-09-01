import { copyFile, mkdir, readdir, rm, writeFile } from 'node:fs/promises'

const projectRoot = new URL('../', import.meta.url)
const buildRoot = new URL('../dist/', import.meta.url)
const publishedAssets = new URL('../assets/', import.meta.url)

await rm(publishedAssets, { recursive: true, force: true })
await mkdir(publishedAssets, { recursive: true })

const builtAssets = new URL('assets/', buildRoot)
for (const asset of await readdir(builtAssets)) {
  if (!asset.endsWith('.map')) {
    await copyFile(new URL(asset, builtAssets), new URL(asset, publishedAssets))
  }
}

await copyFile(new URL('index.html', buildRoot), new URL('index.html', projectRoot))
await writeFile(new URL('.nojekyll', projectRoot), '')
