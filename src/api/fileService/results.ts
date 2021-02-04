import { baseUrl } from "./baseUrl"
import { splitCSV } from "./util"
// @ts-ignore
import { Archive } from "libarchive.js/main.js"

const getResultsUrl = (
  valueFile: string | number,
  timestampValue: string | number,
) => `${baseUrl}/MOAU09_RESULTADOS_${valueFile}_${timestampValue}.tar.gz`

export const getResults = (
  valueFile: string | number,
  timestampValue: string | number,
) =>
  fetch(getResultsUrl(valueFile, timestampValue))
    .then((result) => result.arrayBuffer())
    .then((buffer) =>
      Archive.open(
        new File([buffer], "temp.tar.gz", {
          type: "application/x-gzip",
        }),
      ),
    )
    .then((archive) => archive.extractFiles() as File[])
    .then((filesObj) => {
      const files = Object.values(filesObj)
      return Promise.all(
        files.map(async (file) => ({
          name: file.name,
          text: await file.text(),
        })),
      )
    })
    .then((readFiles) => {
      const detalle = readFiles.find((file) => file.name.includes("DETALLE"))!
      const resumen = readFiles.find((file) => file.name.includes("DETALLE"))!

      return {
        detail: splitCSV(detalle.text).map((row) => {
          const [
            CodigoComunidad,
            CodigoCircumscripcion,
            CodigoMunicipio,
            TypeAmbit,
            CodigoPartido,
            PercentVots,
            Vots,
            DiputatsElectes,
          ] = row.split(";")
          return {
            CodigoComunidad,
            CodigoCircumscripcion,
            CodigoMunicipio,
            TypeAmbit,
            CodigoPartido,
            PercentVots,
            Vots,
            DiputatsElectes,
          }
        }),
        summary: splitCSV(resumen.text).map((row) => {
          const [
            CodigoComunidad,
            CodigoCircumscripcion,
            CodigoMunicipio,
            TypeAmbito,
            Date,
            Hour,
            NumCargos,
            PercentEscrutat,
            Participacio,
            PercentParticipacio,
            Abstencio,
            PercentAbstencio,
            VotsNuls,
            PercentVotsNuls,
            VotsBlancs,
            PercentVotsBlancs,
          ] = row.split(";")
          return {
            CodigoComunidad,
            CodigoCircumscripcion,
            CodigoMunicipio,
            TypeAmbito,
            Date,
            Hour,
            NumCargos,
            PercentEscrutat,
            Participacio,
            PercentParticipacio,
            Abstencio,
            PercentAbstencio,
            VotsNuls,
            PercentVotsNuls,
            VotsBlancs,
            PercentVotsBlancs,
          }
        }),
      }
    })
