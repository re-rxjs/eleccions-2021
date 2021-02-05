export const splitCSV = (text: string) => {
  const lines = text.split("\n")
  if (!Boolean(lines[lines.length - 1])) {
    return lines.slice(0, -1)
  }
  return lines
}
