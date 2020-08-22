const { encodeCallScript } = require('@aragon/connect-core')
const { encodeActCall } = require('@aragon/toolkit')

const {
  daoAddress,
  votingAddress,
  financeAddress,
  payments,
  environment,
} = require('./payments.json')

async function main() {
  // Encode a bunch of payments.
  const newImmediatePaymentSignature =
    'newImmediatePayment(address,address,uint256,string)'
  const calldatum = await Promise.all(
    payments.map(({ tokenAddress, receiverAddress, amount, receipt }) =>
      encodeActCall(newImmediatePaymentSignature, [
        tokenAddress,
        receiverAddress,
        amount,
        receipt,
      ])
    )
  )

  const actions = calldatum.map(data => ({
    to: financeAddress,
    data,
  }))

  // Encode all actions into a single EVM script.
  try {
    const script = await encodeCallScript(actions)
    console.log(
      `npx dao exec ${daoAddress} ${votingAddress} newVote ${script} Payments --environment aragon:${environment} `
    )
  } catch (e){
    console.error(e)
  }
  
  process.exit()
}

main()
