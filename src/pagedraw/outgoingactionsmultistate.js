// Generated by https://pagedraw.io/pages/12008
import React from 'react';
import './outgoingactionsmultistate.css';
import ContractForm from '../components/ContractForm'

import ContractData from '../components/ContractData'

export default class Outgoingactionsmultistate extends React.Component {
  render() {
    return (
      <div className="outgoingactionsmultistate">
          { ((this.props.outgoingPaymentIndex == '-1' ? 'hideOptions' : 'showOptions') === "showOptions") ?
              <div className="outgoingactionsmultistate-showoptions-3">
                  <div className="outgoingactionsmultistate-0-0-0" /> 
                  <div className="outgoingactionsmultistate-0-0-1">
                      <div className="outgoingactionsmultistate-0-0-1-0" /> 
                      <div className="outgoingactionsmultistate-rectangle_5">
                          <div className="outgoingactionsmultistate-0-0-1-1-0">
                              <div className="outgoingactionsmultistate-0-0-1-1-0-0" /> 
                              <div className="outgoingactionsmultistate-payment_data_placeholder_-3">
                                  <div>
                                      <ContractData contract="ScorchablePayments" method="payments" isTokenValue={0} keysToScale={["amount", "payeeBondAmount"]} keysToExclude={["isEthPayment", "listIndex"]} keysToRename={{"amount": this.props.outgoingPaymentUsesEth() ? "etherAmount" : "daiAmount"}} prefix="" methodArgs={[this.props.outgoingPaymentIndex]} onDataCallback={this.props.outgoingPaymentDataCallback}/>
                                  </div>
                              </div>
                              <div className="outgoingactionsmultistate-0-0-1-1-0-2" /> 
                          </div>
                          <div className="outgoingactionsmultistate-0-0-1-1-1">
                              <div className="outgoingactionsmultistate-0-0-1-1-1-0" /> 
                              <div className="outgoingactionsmultistate-releasepaceholder-9">
                                  <div>
                                      <ContractForm contract="ScorchablePayments" method="releasePayment" purpose="Release Payment" fixedParams={[this.props.outgoingPaymentIndex, -1]} paramNamesToScale={["amount"]} labels={["Payment ID:", "Amount:"]}  placeholders={["0", "0.0"]}/> 
                                  </div>
                              </div>
                              <div className="outgoingactionsmultistate-0-0-1-1-1-2" /> 
                          </div>
                          <div className="outgoingactionsmultistate-0-0-1-1-2">
                              <div className="outgoingactionsmultistate-scorchplaceholder-2">
                                  <div>
                                      <ContractForm contract="ScorchablePayments" method="scorchPayment" purpose="Scorch Payment" fixedParams={[this.props.outgoingPaymentIndex, -1]} paramNamesToScale={["amountToScorch"]} labels={["Payment ID:", "Amount:"]}  placeholders={["0", "0.0"]}/> 
                                  </div>
                              </div>
                          </div>
                          <div className="outgoingactionsmultistate-0-0-1-1-3">
                              <div className="outgoingactionsmultistate-0-0-1-1-3-0" /> 
                              <div className="outgoingactionsmultistate-topupplaceholder-0">
                                  <div>
                                      <ContractForm contract="ScorchablePayments" method="topUp" purpose="Top Up" fixedParams={[this.props.outgoingPaymentIndex, -1]} paramNamesToScale={["amount"]} labels={["Payment ID:", "Amount:"]}  placeholders={["0", "0.0"]} amountInputs={{"conditional": this.props.outgoingPaymentUsesEth(), "value": "amount"}}/> 
                                  </div>
                              </div>
                              <div className="outgoingactionsmultistate-0-0-1-1-3-2" /> 
                          </div>
                          <div className="outgoingactionsmultistate-0-0-1-1-4">
                              <div className="outgoingactionsmultistate-0-0-1-1-4-0" /> 
                              <div className="outgoingactionsmultistate-extendtimeoutpaceholder-9">
                                  <div>
                                      <ContractForm contract="ScorchablePayments" method="extendInactionTimeout" purpose="Extend Timeout" fixedParams={[this.props.outgoingPaymentIndex]} paramNamesToScale={[]} labels={["Payment ID:"]}  placeholders={["0"]}/> 
                                  </div>
                              </div>
                              <div className="outgoingactionsmultistate-0-0-1-1-4-2" /> 
                          </div>
                          <div className="outgoingactionsmultistate-0-0-1-1-5">
                              <div className="outgoingactionsmultistate-0-0-1-1-5-0" /> 
                              <div className="outgoingactionsmultistate-cancelpaceholder-9">
                                  <div>
                                      <ContractForm contract="ScorchablePayments" method="cancelPayment" purpose="Cancel Payment" fixedParams={[this.props.outgoingPaymentIndex]} paramNamesToScale={[]} labels={["Payment ID:"]}  placeholders={["0"]}/> 
                                  </div>
                              </div>
                              <div className="outgoingactionsmultistate-0-0-1-1-5-2" /> 
                          </div>
                          <div className="outgoingactionsmultistate-0-0-1-1-6" /> 
                      </div>
                      <div className="outgoingactionsmultistate-0-0-1-2" /> 
                  </div>
                  <div className="outgoingactionsmultistate-0-0-2" /> 
              </div>
          : null}
          { ((this.props.outgoingPaymentIndex == '-1' ? 'hideOptions' : 'showOptions') === "hideOptions") ?
              <div className="outgoingactionsmultistate-hideoptions-6">
                  <div className="outgoingactionsmultistate-1-0-0" /> 
                  <div className="outgoingactionsmultistate-1-0-1">
                      <div className="outgoingactionsmultistate-1-0-1-0" /> 
                      <div className="outgoingactionsmultistate-rectangle_6">
                          <div className="outgoingactionsmultistate-1-0-1-1-0">
                              <div className="outgoingactionsmultistate-click_create_payment_to_create_a_new_outgoing_payment_-2">
                                  Click Create Payment to create a new outgoing payment.
                              </div>
                          </div>
                      </div>
                      <div className="outgoingactionsmultistate-1-0-1-2" /> 
                  </div>
                  <div className="outgoingactionsmultistate-1-0-2" /> 
              </div>
          : null}
      </div>
    );
  }
};
