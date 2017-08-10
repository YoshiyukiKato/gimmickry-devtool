import React, { Component } from "react";
import $ from "jquery";

import Icons from "../icons";
import Storage from "../storage";
const storage = Storage.init();

export default class RemoteGimmicks extends Component{
  constructor(props, context){
    super(props, context);
    this.state = {
      gimmicks : [], //表示の時にコントロールする
      statuses : {}
    };
  }

  componentDidMount(){
    storage.get(["remoteGimmicks", "remoteGimmickStatus"], (data) => {
      this.setState({
        status : data.remoteGimmickStatus || {},
        gimmicks : data.remoteGimmicks || []
      });
    });
  }

  render(){
    const gimmickItems = this.state.gimmicks.filter((gimmick) => {
      return gimmick.name.match(new RegExp(this.state.filterPattern || ".*"));
    })
    .map((gimmick, index) => {
      gimmick.status = this.state.status[gimmick.id];
      return (<GimmickItem key={`gimmick_${index}`} gimmick={gimmick} status={status}
        token={this.props.token}
        secret={this.props.secret}
        onSave={this.save.bind(this, index)}
        onRemove={this.remove.bind(this, index)}/>
      );
    });

    return(
      <div id="remote-gimmicks" className={this.props.className}>
        <div id="sync-gimmicks" className="content-section">
          <button id="sync-button" className="button" onClick={this.sync.bind(this)}>
            <Icons.Sync/>
            <span>Sync</span>
          </button>
        </div>
        <div id="filter-gimmicks" className="content-section">
          <input name="pattern" type="text" placeholder="filter pattern" onChange={this.filter.bind(this)}/>
        </div>
        <div className="gimmick-items">
          {gimmickItems}
        </div>
      </div>
    );
  }

  filter(evt){
    this.setState({ filterPattern : evt.target.value });
  }

  sync(){
    $.ajax({
      type : "GET",
      url : "https://jm38lj0j8i.execute-api.ap-northeast-1.amazonaws.com/dev/gizmo?cmd=all",
      dataType : "json",
      success : (data) => {
        storage.set({ remoteGimmicks : data.Items });
        this.setState({ gimmicks : data.Items });
      },
      error : (err) => {
        console.log(err);
      }
    });
  }

  save(index, change){
    const key = this.state.gimmicks[index].id;
    this.state.status[key] = change.status;
    this.setState({ status : this.state.status });
    storage.set({ remoteGimmickStatus : this.state.status });
  }

  remove(index, change){
    //持ち主である場合のみ消せる
    $.ajax({
      type : "POST",
      url : "https://jm38lj0j8i.execute-api.ap-northeast-1.amazonaws.com/dev/gizmo",
      contentType : "json",
      data : JSON.stringify({
        cmd : "remove",
        token : this.props.token,
        secret : this.props.secret,
        item : {
          id : this.state.gimmicks[index].id
        }
      }),
      success : (result) => {
        console.log(result);
      },
      error : (err) => {
        console.log(err);
      }
    });
  }
}

class GimmickItem extends Component{
  constructor(props, context){
    super(props, context);
    this.state = { detail : false };
  }

  render(){
    const detail = this.renderDetail();
    const itemRemove = this.renderItemRemove();
    return(
      <div className="gimmick-item content-section">
        <div className="show-item">
          <div className="item-name">
            <h3 onClick={this.handleSwitchDetail.bind(this)}>
              {this.props.gimmick.user_id} / {this.props.gimmick.name}
              <div className={`toggle-triangle${this.state.detail ? " detail" : ""}`}></div>
            </h3>
          </div>
          <div className="item-media">
          </div>
          <div className="item-switch">
            <div className={`item-switch-on${this.props.gimmick.status ? " active" : ""}`}
            onClick={this.handleStatusChange.bind(this, true)}>on</div>
            <div className={`item-switch-off${this.props.gimmick.status ? "" : " active"}`}
            onClick={this.handleStatusChange.bind(this, false)}>off</div>
          </div>
          {itemRemove} 
        </div>
        {detail}
      </div>
    );
  }

  renderItemRemove(){
    if(this.props.token && this.props.token.split("@")[1] === this.props.gimmick.user_id){
      return (
        <div className={`item-remove`}>
          <Icons.Remove color="#757575" hoverColor="#C62828" cursor="pointer" width="16" height="16" onClick={this.props.onRemove}/>
        </div>
      );
    }else{
      return (
        <div className="item-remove"></div>
      );
    }
  }

  renderDetail(){
    if(this.state.detail){
      return (
      <div className="detail-item">
        <div className="item-target-url section-block">
          <span>Target URL : {this.props.gimmick.targetURL}</span>
        </div>
        <div className="item-repository section-block">
          <span>Repository : {this.props.gimmick.repository}</span>
        </div>
      </div>
      );
    }else{
      return (<div></div>);
    }

  }

  handleSwitchDetail(){    
    this.setState({ detail : !this.state.detail });
  }

  handleStatusChange(status){
    this.props.onSave({ status : status });
  }
}