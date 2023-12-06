# scorchable-payments

https://stobiewan.github.io/scorchable-payments/

Scorchable Payments Overview

Scorchable payments are a simple method for making payments in Dai or ether with more safety than direct transfers for everyone. They are free and have no centralised third party controlling escrows. Neither party can benefit from dishonouring the deal so there is no incentive for scams to ever occur. The process follows three stages:

1 -> A payer creates a payment by sending Dai or ether into the contract and specifying who can receive it and what bond they should pay. During this stage the payer can cancel the payment to reclaim all of the funds unless the bond was zero.

2 -> The payee can pay the bond to remove the payers option to cancel the payment.

3 -> The payer can release any portion of the funds (payment plus bond) to the payee, or scorch them (funds sent to 0x0). The payee can also send the funds back to the payer in case they can not fulfil their end. If the payer fails to act before the timeout date, or extend the timeout date, the payee may claim the funds.

This process means the buyer can not gain the good or service without also losing the payment, and the seller can not gain the funds then never provide the good or service. The seller can not cause the buyer to lose their funds without also losing their bond and the payer enters the destination address so can be sure it is not an extortion contract. As the buyer and seller know who each other are to some degree they have incentives to complete the trade well as their reputation is at stake.
