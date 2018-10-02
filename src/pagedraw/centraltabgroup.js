// Generated by https://pagedraw.io/pages/12008
import React from 'react';
import Leftbutton from './leftbutton';
import Outgoingactionsmultistate from './outgoingactionsmultistate';
import Rightbutton from './rightbutton';
import './centraltabgroup.css';
import ContractForm from '../components/ContractForm'

import ContractData from '../components/ContractData'

export default class Centraltabgroup extends React.Component {
  render() {
    return (
      <div className="centraltabgroup">
          { (this.props.state === "1") ?
              <div className="centraltabgroup-1-3">
                  <div className="centraltabgroup-0-0-0" /> 
                  <div className="centraltabgroup-0-0-1">
                      <div className="centraltabgroup-0-0-1-0" /> 
                      <div className="centraltabgroup-titletext-2">
                          <br/>
                          <div>Scorchable Payments Overview</div>
                          <br/>
                          <br/>
                      </div>
                      <div className="centraltabgroup-0-0-1-2" /> 
                  </div>
                  <div className="centraltabgroup-0-0-2" /> 
                  <div className="centraltabgroup-0-0-3">
                      <div className="centraltabgroup-0-0-3-0" /> 
                      <div className="centraltabgroup-summarytext-9">
                          <div>{"Scorchable payments are a simple way of making payments in Dai or ether with more safety than direct transfers for both the payer and payee. There are no fees involved nor any centralised third party controlling escrows. The risks associated with direct transfers are reduced by removing the ability to profit through fraud for both parties, so there is no incentive for scammers to ever participate. The process follows the following three stages:"}</div>
                          <br/>
                          <br/>
                      </div>
                      <div className="centraltabgroup-0-0-3-2" /> 
                  </div>
                  <div className="centraltabgroup-0-0-4" /> 
                  <div className="centraltabgroup-0-0-5">
                      <div className="centraltabgroup-0-0-5-0" /> 
                      <div className="centraltabgroup-phasestext-2">
                          <div>{"Stage 1 -> A payer creates a payment by sending the Dai or ether into the contract, specifying the payee address, payee bond quantity required and the timeout period the payer must act by. During this stage the payer can cancel the payment to reclaim all of the funds."}</div>
                          <br/>
                          <br/>
                          <div>{"Stage 2 -> If a bond was specified the payee pays the bond, otherwise this step is skipped. Once the bond is paid the payer can no longer cancel the payment."}</div>
                          <br/>
                          <br/>
                          <div>{"Stage 3 -> After the payee optionally provides the good or service, the payer can either release the funds (including the payees bond) to the payee, or scorch them. Either action can be taken on any fraction of the funds. The payee may release the funds back to the payer in case they can not fulfil the deal. If the payer fails to act before the timeout date, or extend the timeout date, the payee may claim the funds."}</div>
                          <br/>
                          <br/>
                      </div>
                      <div className="centraltabgroup-0-0-5-2" /> 
                  </div>
                  <div className="centraltabgroup-0-0-6" /> 
                  <div className="centraltabgroup-0-0-7">
                      <div className="centraltabgroup-this_process_means_the_buyer_can_not_hope_to_gain_the_good_or_service_without_also_losing_the_funds_and_the_seller_can_not_hope_to_gain_the_funds_then_never_provide_the_good_or_service_the_seller_can_not_cause_the_buyer_to_lose_their_funds_without_also_losing_their_bond_the_payer_is_aware_of_the_destination_address_so_can_be_sure_it_is_not_an_extortion_contract_and_as_the_buyer_and_seller_know_who_each_other_are_to_some_degree_they_have_incentives_to_complete_the_trade_well_as_their_reputation_is_at_stake_as_there_is_nothing_to_be_gained_from_scams_they_are_extremely_unlikely_to_ever_occur_and_users_of_scorchable_payments_can_rationally_expect_the_counterparty_to_behave_with_the_objective_to_make_the_transaction_successful_-4">
                          <div>This process means the buyer can not hope to gain the good or service without also losing the funds, and the seller can not hope to gain the funds then never provide the good or service. The seller can not cause the buyer to lose their funds without also losing their bond. The payer is aware of the destination address so can be sure it is not an extortion contract, and as the buyer and seller know who each other are to some degree they have incentives to complete the trade well as their reputation is at stake. As there is nothing to be gained from  scams they are extremely unlikely to ever occur and users of scorchable payments can rationally expect the counterparty to behave with the objective to make the transaction successful.</div>
                          <br/>
                          <br/>
                      </div>
                  </div>
                  <div className="centraltabgroup-0-0-8" /> 
                  <div className="centraltabgroup-0-0-9">
                      <div className="centraltabgroup-0-0-9-0" /> 
                      <div className="centraltabgroup-contract_address_0">
                          <div>Contract address 0x000</div>
                          <div>{"https://github.com/stobiewan/scorchable-payments"}</div>
                          <div>{"https://en.wikipedia.org/wiki/Scorched_earth"}</div>
                      </div>
                      <div className="centraltabgroup-0-0-9-2" /> 
                  </div>
                  <div className="centraltabgroup-0-0-10" /> 
              </div>
          : null}
          { (this.props.state === "2") ?
              <div className="centraltabgroup-2-0">
                  <div className="centraltabgroup-1-0-0" /> 
                  <div className="centraltabgroup-1-0-1">
                      <div className="centraltabgroup-1-0-1-0" /> 
                      <div className="centraltabgroup-rectangle_2">
                          <div className="centraltabgroup-1-0-1-1-0" /> 
                          <div className="centraltabgroup-1-0-1-1-1">
                              <div className="centraltabgroup-1-0-1-1-1-0" /> 
                              <div className="centraltabgroup-daisummarytext-1">
                                  Before you can send Dai for payments or bonds you need to approve this contract to transfer it. You can approve as much as you want, only what you actually send can be transferred from your balance.
                              </div>
                              <div className="centraltabgroup-1-0-1-1-1-2" /> 
                          </div>
                          <div className="centraltabgroup-1-0-1-1-2" /> 
                          <div className="centraltabgroup-1-0-1-1-3">
                              <div className="centraltabgroup-1-0-1-1-3-0" /> 
                              <div className="centraltabgroup-rectangle-3">
                                  <div className="centraltabgroup-1-0-1-1-3-1-0">
                                      <div className="centraltabgroup-owneddaiplaceholder-4">
                                          <div>
                                              <ContractData contract="DSToken" method="balanceOf" isTokenValue={1} prefix="Dai you own: " methodArgs={[this.props.accounts[0]]}/>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="centraltabgroup-1-0-1-1-3-1-1">
                                      <div className="centraltabgroup-approveddaiplaceholder-8">
                                          <div>
                                              <ContractData contract="DSToken" method="allowance" isTokenValue={1} prefix="Dai approved for contract: " methodArgs={[this.props.accounts[0], "contractPlaceholder:ScorchablePayments"]}/>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              <div className="centraltabgroup-1-0-1-1-3-2" /> 
                          </div>
                          <div className="centraltabgroup-1-0-1-1-4" /> 
                          <div className="centraltabgroup-1-0-1-1-5">
                              <div className="centraltabgroup-approvedaiplaceholder-4">
                                  <div>
                                      <ContractForm contract="DSToken" method="approve" purpose="Approve Dai" fixedParams={["contractPlaceholder:ScorchablePayments", -1]} paramNamesToScale={["wad"]} labels={["guy", "Dai Quantity"]}  placeholders={["0", "0"]}/> 
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div className="centraltabgroup-1-0-1-2" /> 
                  </div>
                  <div className="centraltabgroup-1-0-2" /> 
              </div>
          : null}
          { (this.props.state === "3") ?
              <div className="centraltabgroup-3-4">
                  <div className="centraltabgroup-2-0-0">
                      <div className="centraltabgroup-2-0-0-0" /> 
                      <div className="centraltabgroup-create_payment-6">
                          Create a payment to a payee in ether or Dai. Once it is created the funds will be stored in the smart contract. If a bond is specified the payee will then be able to pay the bond and until they do the payment can be cancelled with all of the funds returned to you. 
                      </div>
                      <div className="centraltabgroup-2-0-0-2" /> 
                  </div>
                  <div className="centraltabgroup-2-0-1" /> 
                  <div className="centraltabgroup-2-0-2">
                      <div className="centraltabgroup-createpaymentplaceholder-6">
                          <div>
                              <ContractForm contract="ScorchablePayments" method="createPayment" purpose="Create Payment" fixedParams={[-1, -1, -1, -1, -1]} paramNamesToScale={["amountToPay", "payeeBondAmount"]} labels={["Payee address:", "Payment amount:", "Bond required:", "Inaction timeout s:", "Currency:"]}  placeholders={["0x0000000000000000000000000000000000000000", "0.0", "0.0", "604800", "true"]} amountInputs={{"conditional": "isEthPayment", "value": "amountToPay"}}/> 
                          </div>
                      </div>
                  </div>
                  <div className="centraltabgroup-2-0-3" /> 
              </div>
          : null}
          { (this.props.state === "4") ?
              <div className="centraltabgroup-4-5">
                  <div className="centraltabgroup-3-0-0" /> 
                  <div className="centraltabgroup-3-0-1">
                      <div className="centraltabgroup-rectangle_4">
                          <div className="centraltabgroup-3-0-1-0-0">
                              <div className="centraltabgroup-leftbutton_instance-6">
                                  <Leftbutton onClick={(() => this.props.onChangeOutgoingIndex(-1))} /> 
                              </div>
                          </div>
                      </div>
                      <div className="centraltabgroup-3-0-1-1" /> 
                      <div className="centraltabgroup-3-0-1-2">
                          <div className="centraltabgroup-3-0-1-2-0">
                              <div className="centraltabgroup-outgoingpaymentsheader-1">
                                  These are the outgoing payments from your address. You can cycle through them and depending no their state cancel, release or scorch them.
                              </div>
                          </div>
                          <div className="centraltabgroup-3-0-1-2-1">
                              <div className="centraltabgroup-paymentindextext-1">
                                  { this.props.localOutgoingIndexString }
                              </div>
                          </div>
                          <div className="centraltabgroup-3-0-1-2-2">
                              <div className="centraltabgroup-outgoingactionsmultistate_instance-3">
                                  <Outgoingactionsmultistate outgoingPaymentIndex={this.props.outgoingPaymentIndex} /> 
                              </div>
                          </div>
                      </div>
                      <div className="centraltabgroup-3-0-1-3" /> 
                      <div className="centraltabgroup-rectangle_3">
                          <div className="centraltabgroup-3-0-1-4-0">
                              <div className="centraltabgroup-rightbutton_instance-5">
                                  <Rightbutton onClick={(() => this.props.onChangeOutgoingIndex(1))} /> 
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="centraltabgroup-3-0-2" /> 
              </div>
          : null}
          { (this.props.state === "5") ?
              <div className="centraltabgroup-5" /> 
          : null}
      </div>
    );
  }
};
