import { combineLatest } from "rxjs"
import { map } from "rxjs/operators"
import { recordFromEntries } from "utils/record-utils"
import { participation$, Participation } from "api/participation"
import { PartyId } from "api/parties"
import { Provinces, sitsByProvince } from "api/provinces"
import { Votes, votes$ } from "api/votes"
import { dhondt } from "../../utils/dhondt"

interface PartyResults {
  votes: number
  percent: number
  sits: number
}

export interface Results extends Omit<Votes, "parties"> {
  parties: Record<PartyId, PartyResults>
}

const getProvinceResults = (
  votes: Votes,
  { nVoters }: Participation,
  province: Provinces,
): Results => {
  const nSits = sitsByProvince[province]
  const validVotes = nVoters - votes.nil
  const threshold = Math.round(validVotes * 0.03)

  const parties: Record<string, PartyResults> = {}
  Object.entries(votes.parties).forEach(([party, votes]) => {
    parties[party] = {
      votes,
      percent: Math.round((votes / validVotes) * 10000) / 100,
      sits: 0,
    }
  })
  dhondt(votes.parties, nSits, threshold).forEach(([party]) => {
    parties[party].sits++
  })

  return {
    ...votes,
    parties,
  }
}

const results$ = combineLatest([votes$, participation$]).pipe(
  map(([votes, participation]) =>
    recordFromEntries(
      Object.values(Provinces).map((province) => [
        province,
        getProvinceResults(votes[province], participation[province], province),
      ]),
    ),
  ),
)
