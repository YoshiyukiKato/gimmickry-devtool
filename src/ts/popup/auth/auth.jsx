import React, { Component } from "react";
import $ from "jquery";
import Icons from "../icons";
import Storage from "../storage";
const storage = Storage.init();

import SignUp from "./signup";
import SignIn from "./signin";


//secretがなかったら、無効化する
export default class Auth extends Component{
  constructor(props, context){
    super(props, context);
    this.state = { 
      gizmo_token : null,
      type : "signup"
    };
  }

  render(){
    const gizmoAuth = this.renderGizmoAuth();
    return(
      <div id="auth" className={this.props.className}>
        <div id="gizmo-auth" className="content-section">
          {gizmoAuth}
        </div>
      </div>
    );
  }

  renderGizmoAuth(){
    if(this.props.secret){
      return (<Authable {...this.props}/>);
    }else{
      return (<Unauthable {...this.props}/>);
    }
  }
}

class Authable extends Component{
  constructor(props, context){
    super(props, context);
    this.state = {
      gizmo_token : null,
      type : "signup"
    };
  }

  componentDidMount(){
    storage.get(["gizmo_token"], (data) => {
      this.setState({ gizmo_token : data.gizmo_token });
    });
  }

  render(){
    if(!this.state.gizmo_token && this.state.type === "signup"){
      return (<SignUp onAuth={this.handleAuth.bind(this)} switch={this.switchAuthType.bind(this, "signin")} secret={this.props.secret}/>); 
    }else if(!this.state.gizmo_token && this.state.type === "signin"){
      return (<SignIn onAuth={this.handleAuth.bind(this)} switch={this.switchAuthType.bind(this, "signup")} secret={this.props.secret}/>);
    }else{
      return (
        <div id="authed">
          <div className="auth-user section-block">
            <div className="user-info">
              <div className="user-name">id : {this.state.gizmo_token.split("@")[1]}</div>
            </div>
            <div className="user-link">
              <div>
                <Icons.Gizmo width="12" height="12" viewBox="0 0 24 24"/>
              </div>
            </div>
          </div>
          <div className="section-block">
            <button className="button" onClick={this.signout.bind(this)}>Sign out</button>          
          </div>
        </div>
      );
    }
  }

  switchAuthType(type){
    this.setState({ type: type });
  }

  handleAuth(gizmo_token){
    storage.set({ gizmo_token : gizmo_token });
    this.setState({ gizmo_token : gizmo_token });
  }

  signout(){
    storage.remove("gizmo_token");
    this.setState({ gizmo_token : null });
  }
};

class Unauthable extends Component{
  constructor(props, context){
    super(props, context);
  }

  render(){
    return (
      <div id="unauthable">
        <Icons.Warning color="#D32F2F"/>
        <span>You are out of authorized network.</span>
      </div>
    );
  }
};