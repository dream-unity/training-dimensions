import { readdir, rename, rm } from 'node:fs/promises'

const outputDirectory = new URL('../dist/', import.meta.url)
const outputAssets = new URL('assets/', outputDirectory)

await rename(new URL('app.html', outputDirectory), new URL('index.html', outputDirectory))

for (const name of await readdir(outputAssets)) {
  if (name.endsWith('.map')) await rm(new URL(name, outputAssets))
}
