import { baseUrl } from "./baseUrl"
import { splitCSV } from "./util"

const getTimestampUrl = () => `${baseUrl}/MOAU09_CT.csv#${Math.random()}`

export const getTimestampFile = () =>
  fetch(getTimestampUrl())
    .then((result) => result.text())
    .then((text) =>
      splitCSV(text).map((row) => {
        const [
          CodeScreen,
          TimestampCandidaturaValue,
          TimestampValue,
        ] = row.split(";")
        return { CodeScreen, TimestampCandidaturaValue, TimestampValue }
      }),
    )
