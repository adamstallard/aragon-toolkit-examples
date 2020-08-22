const { encodeCallScript } = require('@aragon/connect-core')
const { encodeActCall } = require('@aragon/toolkit')

const {
  daoAddress,
  tokenManagerAddress,
  votingAddress,
  mints,
  burns,
  environment,
} = require('./assignations.json')

async function main() {
  // Encode a bunch of token mints and burns.
  const mintSignature = 'mint(address,uint256)'
  const burnSignature = 'burn(address,uint256)'
  const calldatum = await Promise.all([
    ...mints.map(([receiverAddress, amount]) =>
      encodeActCall(mintSignature, [receiverAddress, amount])
    ),
    ...burns.map(([holderAddress, amount]) =>
      encodeActCall(burnSignature, [holderAddress, amount])
    ),
  ])

  const actions = calldatum.map(data => ({
    to: tokenManagerAddress,
    data,
  }))

  // Encode all actions into a single EVM script.
  try {
    const script = await encodeCallScript(actions)
    console.log(
      `npx dao exec ${daoAddress} ${votingAddress} newVote ${script} MintsAndBurns --environment aragon:${environment} `
    )
  } catch (e){
    console.error(e)
  }
  
  process.exit()
}

main()
