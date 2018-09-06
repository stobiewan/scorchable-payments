// Generated by https://pagedraw.io/pages/12008
import React from 'react';
import Buttonwithstate from './buttonwithstate';
import Centraltabgroup from './centraltabgroup';
import './mainscreen.css';


export default class Mainscreen extends React.Component {
  render() {
    return (
      <div className="mainscreen-mainscreen-0">
          <div className="mainscreen-0">
              <div className="mainscreen-image-0">
                  <div className="mainscreen-0-0-0" /> 
                  <div className="mainscreen-0-0-1">
                      <div className="mainscreen-tabbuttons-0">
                          <div className="mainscreen-0-0-1-0-0">
                              <div onClick={() => this.props.setSelectedTab(1)} className="mainscreen-tabbutton1">
                                  <Buttonwithstate state={(this.props.selectedTab === 1 ? "selected" : "unselected")} text={"Intro"} text2={"Intro"} /> 
                              </div>
                              <div onClick={() => this.props.setSelectedTab(2)} className="mainscreen-tabbutton2">
                                  <Buttonwithstate state={(this.props.selectedTab === 2 ? "selected" : "unselected")} text={"Manage Dai"} text2={"Manage Dai"} /> 
                              </div>
                              <div onClick={() => this.props.setSelectedTab(3)} className="mainscreen-tabbutton3">
                                  <Buttonwithstate state={(this.props.selectedTab === 3 ? "selected" : "unselected")} text={"Create Payment"} text2={"Create Payment"} /> 
                              </div>
                              <div onClick={() => this.props.setSelectedTab(4)} className="mainscreen-tabbutton4">
                                  <Buttonwithstate state={(this.props.selectedTab === 4 ? "selected" : "unselected")} text={"Outgoing"} text2={"Outgoing"} /> 
                              </div>
                              <div onClick={() => this.props.setSelectedTab(5)} className="mainscreen-tabbutton5">
                                  <Buttonwithstate state={(this.props.selectedTab === 5 ? "selected" : "unselected")} text={"Incoming"} text2={"Incoming"} /> 
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="mainscreen-0-0-2" /> 
                  <div className="mainscreen-0-0-3">
                      <div className="mainscreen-0-0-3-0" /> 
                      <div className="mainscreen-centraltabgroup_instance-9">
                          <Centraltabgroup state={(this.props.selectedTab.toString())} accounts={this.props.accounts} onApproveDai={this.props.onApproveDai} text={""} /> 
                      </div>
                      <div className="mainscreen-0-0-3-2" /> 
                  </div>
                  <div className="mainscreen-0-0-4" /> 
              </div>
          </div>
          <div className="mainscreen-1" /> 
      </div>
    );
  }
};
