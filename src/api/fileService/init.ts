// @ts-ignore
import { Archive } from "libarchive.js/main.js"

export const init = () => {
  Archive.init({
    workerUrl: "libarchive.js/dist/worker-bundle.js",
  })
}
