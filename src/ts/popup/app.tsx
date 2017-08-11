import React, { Component } from "react";
import * as $ from "jquery";

import {Local} from "./gimmicks";
import Users from "./users";
import * as Icons from "./icons";
import Storage from "../utils/storage";

const storage = Storage.init();

interface AppState{
  tab : string;
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
    storage.get("gizmo_token", (data:any) => {
      this.setState({ token : data.gizmo_token });
    });
    this.validate();
  }

  validate(){
    $.ajax({
      method : "GET",
      url : "https://s3-ap-northeast-1.amazonaws.com/gizmo-assets/private/secret.txt",
      success : (secret:string) => {
        this.setState({ secret : secret });
      },
      error : (err) => {}
    });
  }

  save(nextState:any){
    this.setState(nextState);
  }

  switchTab(tab:string){
    this.setState({ tab : tab });
  }

  render(){
    return (
      <div id="app">
        <div id="tabs">
          <div id="tab-view" className={`tab${this.state.tab==="view" ? " active" : ""}`} onClick={this.switchTab.bind(this, "view")}>
            <Icons.UIComponent/>
            <span>View</span>
          </div>
          <div id="tab-user" className={`tab${this.state.tab==="users" ? " active" : ""}`} onClick={this.switchTab.bind(this, "users")}>
            <Icons.People/>
            <span>User</span>
          </div>
        </div>
        <Local className={`tab-content${this.state.tab==="view" ? " active" : ""}`} token={this.state.token} secret={this.state.secret}/>
        <Users className={`tab-content${this.state.tab==="users" ? " active" : ""}`} token={this.state.token} secret={this.state.secret}/>
      </div>
    );
  }
}
