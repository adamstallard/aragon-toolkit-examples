const { encodeCallScript } = require('@aragon/connect-core')
const { encodeActCall } = require('@aragon/toolkit')

const [daoAddress, votingAddress, agentAddress, amount] = process.argv.slice(2)

async function main() {
  // Encode a bunch of payments.
  const newApproveSignature = 'approve(address,uint256)'
  const swapSaiToDaiSignature = 'swapSaiToDai(uint256)'
  const forwardSignature = 'forward(bytes)'

  const saiTokenAddress = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
  const migrationContractAddress = '0xc73e0383F3Aff3215E6f04B0331D58CeCf0Ab849'
  const uint256Max = `0x${'f'.repeat(64)}` // 0xfffff...

  const script1 = encodeCallScript([
    {
      to: saiTokenAddress,
      data: await encodeActCall(newApproveSignature, [
        migrationContractAddress,
        uint256Max,
      ]),
    },
  ])

  const script2 = encodeCallScript([
    {
      to: migrationContractAddress,
      data: await encodeActCall(swapSaiToDaiSignature, [amount]),
    },
  ])

  // Encode all actions into a single EVM script.
  try {
    const script = encodeCallScript([
      {
        to: agentAddress,
        data: await encodeActCall(forwardSignature, [script1]),
      },
      {
        to: agentAddress,
        data: await encodeActCall(forwardSignature, [script2]),
      },
    ])
    console.log(
      `npx dao exec ${daoAddress} ${votingAddress} newVote ${script} SwapSaiToDai --environment aragon:mainnet`
    )
  } catch (e){
    console.error(e)
  }

  process.exit()
}

main()
