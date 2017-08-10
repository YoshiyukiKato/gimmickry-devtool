import React, {Component} from "react";
import * as $ from "jquery";

import AceEditor from "react-ace";
import brace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/clouds';

import * as Icons from "../icons";
import Storage from "../../utils/storage";
const storage = Storage.init();

interface GimmicksProps{
  token?:string;
  secret?:string;
  className:string;
}

interface GimmicksState{
  gimmicks : any[];
}

export default class LocalGimmicks extends Component<GimmicksProps, GimmicksState>{
  constructor(props:GimmicksProps){
    super(props);
    this.state = {
      gimmicks : []
    };
  }

  componentDidMount(){
    storage.get(["localGimmicks"], (data:any) => {
      if(data.localGimmicks){
        this.setState({ gimmicks : data.localGimmicks });
      }
    });
  }

  add(){
    const newItem = {};
    this.state.gimmicks.push(newItem);
    this.setState({ gimmicks : this.state.gimmicks });
  }
  
  update(index:number, change:any){
    const prev = this.state.gimmicks[index];
    const next = Object.assign(prev, change);
    this.state.gimmicks[index] = next;
    this.setState({ gimmicks : this.state.gimmicks });
  }

  save(index:number, change:any){
    this.update(index, change);
    storage.set({ localGimmicks : this.state.gimmicks }, () => {
      console.log("save!");
    });
  }

  remove(index:number){
    this.state.gimmicks.splice(index, 1);
    this.setState({ gimmicks : this.state.gimmicks });
    storage.set({ localGimmicks : this.state.gimmicks });
  }

  render(){
    const gimmickItems = this.state.gimmicks.map((gimmick, index) => {
      return (<GimmickItem key={`gimmick_${index}`} gimmick={gimmick}
        token={this.props.token}
        secret={this.props.secret}
        onSave={this.save.bind(this, index)}
        onChange={this.update.bind(this, index)}
        onRemove={this.remove.bind(this, index)}/>);
    });
    return(
      <div id="local-gimmicks" className={this.props.className}>
        <div className="content-section">
          <button id="add-gimmick" className="button" onClick={this.add.bind(this)}>
            <Icons.Add/>
            <span>Add</span>
          </button>
        </div>
        <div className="gimmick-items">
          {gimmickItems}
        </div>
      </div>
    );
  }
}

interface GimmickProps{
  gimmick : any;
  token? : string;
  secret? : string;
  onChange : (change:any) => any;
  onRemove : () => any;
  onSave : (date:any) => any;
}

interface GimmickState{

}

class GimmickItem extends Component<GimmickProps, any>{
  constructor(props:GimmickProps){
    super(props);
    this.state = {
      edit : false
    };
  }
 
  componentDidMount(){
    if(!this.props.gimmick.name){
      this.setState({ edit : true });
    }
  }
 
  render(){
    const editor = this.renderEditor();
    return(
      <div className="gimmick-item content-section">
        <div className="show-item">
          <div className="item-name">
            <h3 onClick={this.handleSwitchEdit.bind(this)}>{this.props.gimmick.name}
              <div className={`toggle-triangle${this.state.edit ? " edit" : ""}`}></div>
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
      return (<EditItem onSave={this.props.onSave} gimmick={this.props.gimmick} token={this.props.token}
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
  gimmick : any;
  onSave : (item:any) => any;
  secret? : string;
  token? : string;
}

interface EditItemState{
  afterSave : any;
  id? : string;
  name? : string;
  description? : string;
  targetURL? : string;
  script? : string;
}

class EditItem extends Component<EditItemProps, EditItemState>{
  constructor(props:EditItemProps){
    super(props);
    this.state = Object.assign({
      afterSave : {}
    }, props.gimmick);
  }

  render(){
    return(
      <div className="edit-item">
        <div className="item-name section-block">
          <h4>Name</h4>
          <input type="text" onChange={this.handleNameChange.bind(this)} placeholder="Name" defaultValue={this.props.gimmick.name}/>
        </div>
        <div className="item-target-url section-block">
          <h4>Target URL</h4>
          <input type="text" onChange={this.handleTargetURLChange.bind(this)} placeholder="Target URL pattern" defaultValue={this.props.gimmick.targetURL}/>
        </div>

        <div className="item-file section-block">
          <h4>Script</h4>
          <div className="section-block">
            <input ref="file" type="file" accept=".js" hidden={true} onChange={this.handleFileSelect.bind(this)}/>
            <button className="button" onClick={this.openFileBrowser.bind(this)}>Select file</button>
          </div>
          
          <div className="section-block">
            <AceEditor
              mode="javascript"
              value={this.state.script}
              tabSize={2}
              theme="clouds"
              width="300px"
              height="150px"
              onChange={this.handleScriptChange.bind(this)}
              name={`editor_${this.props.gimmick.name}`}
              setOptions={{showInvisibles: true}}
            />
          </div>

        </div>
        <div className="section-block">
          <button className="button" onClick={this.handleSave.bind(this)}>Save local</button>
          <button className="button publish-item" onClick={this.handlePublish.bind(this)} disabled={!this.props.token}>Publish</button>
          <div className={`after-save ${this.state.afterSave.isVisible ? "visible" : "hidden"} ${this.state.afterSave.status ? "success" : "error"}`}>
            {this.state.afterSave.text}
          </div>
        </div>
      </div>
    );
  }

  handleSave(){
    const item = {
      id : this.state.id,
      name : this.state.name,
      description : this.state.description,
      targetURL : this.state.targetURL,
      script : this.state.script || "//NO CODE PROVIDED (-.-)"
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

  handlePublish(){
    const item = {
      id : this.state.id,
      name : this.state.name,
      description : this.state.description,
      targetURL : this.state.targetURL,
      script : this.state.script || "//NO CODE PROVIDED (-.-)"
    };

    $.ajax({
      type : "post",
      url : "https://jm38lj0j8i.execute-api.ap-northeast-1.amazonaws.com/dev/gizmo",
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

  isValid(){
    return (
      this.state.name && this.state.name.length > 0
      && this.state.targetURL && this.state.targetURL.length > 0
      && this.state.script && this.state.script.length > 0
    );
  } 

  handleNameChange(evt:any){
    this.setState({ name : evt.target.value });
  }

  handleTargetURLChange(evt:any){
    this.setState({ targetURL : evt.target.value  });
  }

  handleScriptChange(script:string){
    this.setState({ script : script })
  }

  openFileBrowser(){
    $(this.refs.file).click();
  }

  handleFileSelect(evt:any){
    const file = evt.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(this:EditItem,evt:any){
      this.handleScriptChange(evt.target.result);
    }.bind(this);
    reader.readAsText(file);
  }
}