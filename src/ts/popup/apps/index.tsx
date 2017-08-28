import React, {Component} from "react";
import $ from "jquery";
import uuid from "uuid";

import AceEditor from "react-ace";
import brace from 'brace';
import 'brace/mode/json';
import 'brace/theme/clouds';

import * as Icons from "../icons";
import Storage from "../../utils/storage";
import {red, green} from "material-design-color-module";

const storage = Storage.init();

interface AppsProps{
  token?:string;
  secret?:string;
  className:string;
}

interface AppsState{
  apps : any[];
}

export default class LocalApps extends Component<AppsProps, AppsState>{
  constructor(props:AppsProps){
    super(props);
    this.state = {
      apps : []
    };
  }

  componentDidMount(){
    storage.get(["localApps"], (data:any) => {
      if(data.localApps){
        this.setState({ apps : data.localApps });
      }
    });
  }

  add(){
    //TODO: set uuid when adding item
    const newItem = {
      _lid : uuid.v4(),
      name : "",
      targetURL : "",
      source : ""
    };
    this.state.apps.push(newItem);
    this.setState({ apps : this.state.apps });
  }
  
  update(index:number, change:any){
    const prev = this.state.apps[index];
    const next = Object.assign(prev, change);
    this.state.apps[index] = next;
    this.setState({ apps : this.state.apps });
  }

  save(index:number, change:any){
    this.update(index, change);
    storage.set({ localApps : this.state.apps }, () => {
      console.log("save!");
    });
  }

  remove(index:number){
    delete this.state.apps[index];
    this.setState({ apps : this.state.apps });
    storage.set({ localApps : this.state.apps });
  }

  render(){
    const appItems = this.state.apps.map((app, index) => {
      if(!app) return;     
      return (<AppItem key={`app-${app._lid}`} app={app}
        token={this.props.token}
        secret={this.props.secret}
        onSave={this.save.bind(this, index)}
        onChange={this.update.bind(this, index)}
        onRemove={this.remove.bind(this, index)}/>);
    }).filter((item:any) => !!item);

    return <div id="local-apps" className={this.props.className}>
      <div className="content-section">
        <button id="add-app" className="button" onClick={this.add.bind(this)}>
          <Icons.Add/>
          <span>Add</span>
        </button>
      </div>
      <div className="app-items">
        {appItems}
      </div>
    </div>
  }
}

interface AppProps{
  app : any;
  token? : string;
  secret? : string;
  onChange : (change:any) => any;
  onRemove : () => any;
  onSave : (date:any) => any;
}

interface AppState{
  
}

class AppItem extends Component<AppProps, any>{
  constructor(props:AppProps){
    super(props);
    this.state = {
      edit : false
    };
  }
 
  componentDidMount(){
    if(!this.props.app.name){
      this.setState({ edit : true });
    }
  }
 
  render(){
    const editor = this.renderEditor();
    return(
      <div className="app-item content-section">
        <div className="show-item">
          <div className="item-name">
            <h3 onClick={this.handleSwitchEdit.bind(this)}>{this.props.app.name}
              <div className={`toggle-triangle${this.state.edit ? " edit" : ""}`}></div>
            </h3>
          </div>
          <div className="item-media">
          </div>
          <div className="item-switch">
            <div className={`item-switch-on${this.props.app.status ? " active" : ""}`}
            onClick={this.handleStatusChange.bind(this, true)}>on</div>
            <div className={`item-switch-off${this.props.app.status ? "" : " active"}`}
            onClick={this.handleStatusChange.bind(this, false)}>off</div>
          </div>
          
          <div className="item-remove">
            <Icons.Remove color="#757575" hoverColor="#C62828" cursor="pointer" width="16" height="16" onClick={this.props.onRemove}/>
          </div>
        </div>
        {editor}
      </div>
    );
  }

  renderEditor(){
    if(this.state.edit){
      return (<EditItem onSave={this.props.onSave} app={this.props.app} token={this.props.token}
        secret={this.props.secret}/>);
    }else{
      return (<div></div>);
    }
  }

  handleSwitchEdit(){    
    this.setState({ edit : !this.state.edit });
  }

  handleStatusChange(status:any){
    this.props.onSave({ status : status });
  }
}

interface EditItemProps{
  app : any;
  onSave : (item:any) => any;
  secret? : string;
  token? : string;
}

interface EditItemState{
  afterSave : any;
  submitStatus : string;
  name : string;
  targetURL : string;
  source : string;
  sourceCheckStatus : string;
}

class EditItem extends Component<EditItemProps, EditItemState>{
  constructor(props:EditItemProps){
    super(props);
    let initialState = Object.assign({ afterSave : {} }, this.initialState);
    this.state = Object.assign(initialState, props.app);
  }

  get initialState(){
    return {
      _lid : uuid.v4(), //local id
      afterSave : {},
      name : "",
      targetURL : "",
      source : "",
      sourceCheckStatus : ""
    };
  }

  render(){
    return(
      <div className="edit-item">
        <div className="item-name section-block">
          <h4>Name</h4>
          <input type="text" onChange={this.handleNameChange} placeholder="Name" defaultValue={this.props.app.name}/>
        </div>
        <div className="item-target-url section-block">
          <h4>Target URL</h4>
          <input type="text" onChange={this.handleTargetURLChange} placeholder="Target URL pattern" defaultValue={this.props.app.targetURL}/>
        </div>

        <div className="item-source section-block">
          <h4>Source</h4>
          <div className="section-block submit-action">
            <input ref="file" type="file" accept=".js" hidden={true} onChange={this.handleFileSelect.bind(this)}/>
            <button className="button" onClick={this.openFileBrowser.bind(this)}>Select file</button>
            {this.renderSourceCheckStatus()}
          </div>
        </div>
        <div className="section-block">
          <button className="button" onClick={this.handleSave.bind(this)}>Save local</button>
          <div className={`after-save ${this.state.afterSave.isVisible ? "visible" : "hidden"} ${this.state.afterSave.status ? "success" : "error"}`}>
            {this.state.afterSave.text}
          </div>
        </div>
      </div>
    );
  }

  renderSourceCheckStatus(){
    if(this.state.sourceCheckStatus === "success"){
      return <div className="submit-status submit-success">
        <Icons.Success className="status-icon" color={green["500"]}/>
        <div className="status-message">The source is valid</div>
      </div>
    }else if(this.state.sourceCheckStatus === "pending"){
      return <div className="submit-status submit-pending">
        <div className="status-icon">
          <div className="spinner">
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
          </div>
        </div>
        <div className="status-message">Source checking...</div>
      </div>;
    }else if(this.state.sourceCheckStatus === "fail"){ 
      return <div className="submit-status submit-fail">
        <Icons.Fail className="status-iton" color={red["500"]}/>
        <div className="status-message">The source is invalid</div>
      </div>
    }else{
      return <div className="submit-status"></div>;
    }
  }

  handleSave(){
    const item = {
      name : this.state.name,
      targetURL : this.state.targetURL,
      source : this.state.source
    };

    this.props.onSave(item);
    this.afterSave(true, "Saved in local");
  }

  afterSave(status:boolean, text:string){
    const afterSave = { isVisible : true, status : status, text : text };
    this.setState({ afterSave : afterSave });
    setTimeout(() => {
      const afterSave = Object.assign(this.state.afterSave, { isVisible : false });
      this.setState({ afterSave : afterSave });
    }, 3000);
  }

  /*
  handlePublish(){
    const item = {
      name : this.state.name,
      targetURL : this.state.targetURL,
      attrs : this.state.attrs
    };

    $.ajax({
      type : "post",
      url : "",
      contentType : "application/json",
      data : JSON.stringify({
        cmd : "set",
        token : this.props.token,
        secret : this.props.secret,
        item : item
      }),
      success : (result) => {
        this.props.onSave(result.Item);
        this.afterSave(true, "Published")
      },
      error : (err) => {
        console.log("error", err);
        this.afterSave(false, "Falied to publish")
      }
    });
  }
  */

  isValid(){
    return (
      this.state.name && this.state.name.length > 0
      && this.state.targetURL && this.state.targetURL.length > 0
      && this.state.source && this.state.source.length > 0
    );
  } 


  handleNameChange=this.handleInputChange.bind(this, "name")
  handleTargetURLChange=this.handleInputChange.bind(this, "targetURL");
  handleInputChange(name:string, evt:any){
    let nextState:any = {};
    nextState[name] = evt.target.value;
    this.setState(nextState);
  }

  handleSourceChange=this._handleSourceChange.bind(this);
  _handleSourceChange(source:string){
    //sourceのチェックがしたい
    const isValid = (function(){
      var window:any = {};
      eval(source);
      return (
        window.__import_user_attr__ 
        && window.__import_user_attrs_value__
        && window.__import_view_component__
      );
    })();
    
    if(isValid){
      this.setState({
        sourceCheckStatus : "success",
        source : source
      });
    }else{
      this.setState({
        sourceCheckStatus : "fail",
      });
    }
  }

  openFileBrowser(){
    $(this.refs.file).click();
  }

  handleFileSelect(evt:any){
    const file = evt.target.files[0];
    if(!file) return;
    this.setState({
      sourceCheckStatus : "pending",
    });
    const reader = new FileReader();
    reader.onload = function(this:EditItem,evt:any){
      this.handleSourceChange(evt.target.result);
    }.bind(this);
    reader.readAsText(file);
  }
}
