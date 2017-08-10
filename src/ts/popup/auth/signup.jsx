import React, { Component } from "react";
import $ from "jquery";
import Icons from "../icons";

export default class SignUp extends Component{
  constructor(props, context){
    super(props, context);
    this.state = {}
  }
  render(){
    return (
      <div id="signup">
        <div className="section-block">
          <input onChange={this.handleChange.bind(this, "userId")} ref="userId" type="text" placeholder="user id"/>
        </div>
        <div className="section-block">
          <input onChange={this.handleChange.bind(this, "password")} ref="password" type="password" placeholder="password"/>
        </div>
        <div className="section-block">
          <input onChange={this.handleChange.bind(this, "passwordConfirm")} ref="passwordConfirm" type="password" placeholder="password confirm"/>
        </div>
        <div className="section-block">
          <button className="button submit-auth" onClick={this.handleSignUp.bind(this)} disabled={!this.isValid()}>Sign up</button>
          <span className="switch-auth-type" onClick={this.props.switch}>Switch to sign in</span>
        </div>
      </div>
    );
  }
  
  isValid(){
    return this.state.userId && this.state.userId.length > 0 
      && this.state.password && this.state.password.length > 0
      && this.state.passwordConfirm && this.state.passwordConfirm === this.state.password;
  }

  handleChange(paramName, evt){
    const nextState = {};
    nextState[paramName] = evt.target.value;
    this.setState(nextState);
  }

  handleSignUp(){
    $.ajax({
      type : "POST",
      url : "https://jm38lj0j8i.execute-api.ap-northeast-1.amazonaws.com/dev/gizmo",
      contentType : "application/json",
      data : JSON.stringify({
        cmd : "signup",
        secret : this.props.secret,
        user : {
          id : this.state.userId,
          password : this.state.password,
        }
      }),
      
      success : (res) => {
        if(res.token) this.props.onAuth(res.token);
      },
      error : (err) => {
        console.log(err);
      }
    });
  }
}