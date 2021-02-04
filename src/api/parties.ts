import { mapRecord } from "../utils/record-utils"

export enum PartyId {
  Cs = "cs",
  PDeCAT = "pdecat",
  ERC = "erc",
  PSC = "psc",
  Comuns = "ecp",
  CUP = "cup",
  PP = "pp",
  Junts = "junts",
  Vox = "vox",
  PNC = "pnc",
  Primaries = "primaries",
  RecortesZero_UCE = "uce",
  PCTC = "pctc",
  FNC = "fnc",
  IZQP = "izqp",
  PUM_J = "pum_j",
  MCR = "mcr",
  EsconsEnBlanc = "eb",
}

export interface Party {
  id: PartyId
  name: string
  color: string
}

export function getParties(): Record<PartyId, Party> {
  return mapRecord(
    {
      [PartyId.Cs]: {
        name: "C's",
        color: "#EB6109",
      },
      [PartyId.PDeCAT]: {
        name: "PDeCAT",
        color: "#0081C2",
      },
      [PartyId.ERC]: {
        name: "ERC",
        color: "#FFB232",
      },
      [PartyId.PSC]: {
        name: "PSC",
        color: "#E73B39",
      },
      [PartyId.Comuns]: {
        name: "ECP-PEC",
        color: "#6E236E",
      },
      [PartyId.CUP]: {
        name: "CUP-G",
        color: "#FFED00",
      },
      [PartyId.PP]: {
        name: "PP",
        color: "#1E90FF",
      },
      [PartyId.Junts]: {
        name: "Junts",
        color: "#00C3B2",
      },
      [PartyId.Vox]: {
        name: "Vox",
        color: "#63BE21",
      },
      [PartyId.PNC]: {
        name: "PNC",
        color: "#43A2AD",
      },
      [PartyId.Primaries]: {
        name: "Primaries",
        color: "#EC4C5E",
      },
      [PartyId.RecortesZero_UCE]: {
        name: "RECORTES CERO - GV - M",
        color: "#000000",
      },
      [PartyId.PCTC]: {
        name: "PCTC",
        color: "#E40113",
      },
      [PartyId.FNC]: {
        name: "FNC",
        color: "#55A0D9",
      },
      [PartyId.IZQP]: {
        name: "IZQP",
        color: "#C71942",
      },
      [PartyId.PUM_J]: {
        name: "PUM+J",
        color: "#4BBCED",
      },
      [PartyId.MCR]: {
        name: "M.C.R.",
        color: "#DF0101",
      },
      [PartyId.EsconsEnBlanc]: {
        name: "Escons en Blanc",
        color: "#FFFFFF",
      },
    },
    (entry, id) => ({ ...entry, id }),
  )
}
