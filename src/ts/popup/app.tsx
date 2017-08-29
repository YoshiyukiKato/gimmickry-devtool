import React, { Component } from "react";
import {Local} from "./gimmicks";
import Users from "./users";
import Apps from "./apps";
import * as Icons from "./icons";
import Storage from "../utils/storage";

const storage = Storage.init();

interface AppState{
  tab : string;
  status? : boolean;
  token? : string;
  secret? : string;
}

export default class App extends Component<any, AppState>{
  constructor(props:any){
    super(props);
    this.state = {
      tab : "view"
    };
  }

  componentDidMount(){
    storage.get("status", (data:any) => {
      this.setState({ status : data.status });
    });
  }

  save(nextState:any){
    this.setState(nextState);
  }

  switchTab(tab:string){
    this.setState({ tab : tab });
  }

  handleStatusChange(status:boolean){
    storage.set({ status : status });
    this.setState({ status : status });
  }

  render(){
    return (
      <div id="app">
        <div id="app-status">
          <div>Status : </div>
          <div className="item-switch">
            <div className={`item-switch-on ${this.state.status ? "active" : ""}`}
            onClick={this.handleStatusChange.bind(this, true)}>on</div>
            <div className={`item-switch-off ${this.state.status ? "" : "active"}`}
            onClick={this.handleStatusChange.bind(this, false)}>off</div>
          </div>
        </div>
        <div id="tabs">
          <div id="tab-view" className={`tab${this.state.tab==="apps" ? " active" : ""}`} onClick={this.switchTab.bind(this, "apps")}>
            <Icons.Approach/>
            <span>App</span>
          </div>
          <div id="tab-view" className={`tab${this.state.tab==="view" ? " active" : ""}`} onClick={this.switchTab.bind(this, "view")}>
            <Icons.UIComponent/>
            <span>View</span>
          </div>
          <div id="tab-user" className={`tab${this.state.tab==="users" ? " active" : ""}`} onClick={this.switchTab.bind(this, "users")}>
            <Icons.People/>
            <span>User</span>
          </div>
        </div>
        <Apps className={`tab-content${this.state.tab==="apps" ? " active" : ""}`} token={this.state.token} secret={this.state.secret}/>
        <Local className={`tab-content${this.state.tab==="view" ? " active" : ""}`} token={this.state.token} secret={this.state.secret}/>
        <Users className={`tab-content${this.state.tab==="users" ? " active" : ""}`} token={this.state.token} secret={this.state.secret}/>
      </div>
    );
  }
}
