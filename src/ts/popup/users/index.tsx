import React, {Component} from "react";
import uuid from "uuid";

import AceEditor from "react-ace";
import brace from 'brace';
import 'brace/mode/json';
import 'brace/theme/clouds';

import * as Icons from "../icons";
import Storage from "../../utils/storage";
const storage = Storage.init();

interface UsersProps{
  token?:string;
  secret?:string;
  className:string;
}

interface UsersState{
  users : any[];
}

export default class LocalUsers extends Component<UsersProps, UsersState>{
  constructor(props:UsersProps){
    super(props);
    this.state = {
      users : []
    };
  }

  componentDidMount(){
    storage.get(["localUsers"], (data:any) => {
      if(data.localUsers){
        this.setState({ users : data.localUsers });
      }
    });
  }

  add(){
    //TODO: set uuid when adding item
    const newItem = {
      _lid : uuid.v4(),
      name : "",
      targetURL : "",
      attrs : JSON.stringify({
        "key" : "value",
        "by" : "json format"
      }, null, 2)
    };
    this.state.users.push(newItem);
    this.setState({ users : this.state.users });
  }
  
  update(index:number, change:any){
    const prev = this.state.users[index];
    const next = Object.assign(prev, change);
    this.state.users[index] = next;
    this.setState({ users : this.state.users });
  }

  save(index:number, change:any){
    this.update(index, change);
    storage.set({ localUsers : this.state.users }, () => {
      console.log("save!");
    });
  }

  remove(index:number){
    delete this.state.users[index];
    this.setState({ users : this.state.users });
    storage.set({ localUsers : this.state.users });
  }

  render(){
    const userItems = this.state.users.map((user, index) => {
      if(!user) return;     
      return (<UserItem key={`user-${user._lid}`} user={user}
        token={this.props.token}
        secret={this.props.secret}
        onSave={this.save.bind(this, index)}
        onChange={this.update.bind(this, index)}
        onRemove={this.remove.bind(this, index)}/>);
    }).filter((item:any) => !!item);

    return <div id="local-users" className={this.props.className}>
      <div className="content-section">
        <button id="add-user" className="button" onClick={this.add.bind(this)}>
          <Icons.Add/>
          <span>Add</span>
        </button>
      </div>
      <div className="user-items">
        {userItems}
      </div>
    </div>
  }
}

interface UserProps{
  user : any;
  token? : string;
  secret? : string;
  onChange : (change:any) => any;
  onRemove : () => any;
  onSave : (date:any) => any;
}

interface UserState{
  
}

class UserItem extends Component<UserProps, any>{
  constructor(props:UserProps){
    super(props);
    this.state = {
      edit : false
    };
  }
 
  componentDidMount(){
    if(!this.props.user.name){
      this.setState({ edit : true });
    }
  }
 
  render(){
    const editor = this.renderEditor();
    return(
      <div className="user-item content-section">
        <div className="show-item">
          <div className="item-name">
            <h3 onClick={this.handleSwitchEdit.bind(this)}>{this.props.user.name}
              <div className={`toggle-triangle${this.state.edit ? " edit" : ""}`}></div>
            </h3>
          </div>
          <div className="item-media">
          </div>
          <div className="item-switch">
            <div className={`item-switch-on${this.props.user.status ? " active" : ""}`}
            onClick={this.handleStatusChange.bind(this, true)}>on</div>
            <div className={`item-switch-off${this.props.user.status ? "" : " active"}`}
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
      return (<EditItem onSave={this.props.onSave} user={this.props.user} token={this.props.token}
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
  user : any;
  onSave : (item:any) => any;
  secret? : string;
  token? : string;
}

interface EditItemState{
  afterSave : any;
  name : string;
  targetURL : string;
  attrs : string;
}

class EditItem extends Component<EditItemProps, EditItemState>{
  constructor(props:EditItemProps){
    super(props);
    let initialState = Object.assign({ afterSave : {} }, this.initialState);
    this.state = Object.assign(initialState, props.user);
  }

  get initialState(){
    return {
      _lid : uuid.v4(), //local id
      afterSave : {},
      name : "",
      targetURL : "",
      attrs : ""
    };
  }

  render(){
    return(
      <div className="edit-item">
        <div className="item-name section-block">
          <h4>Name</h4>
          <input type="text" onChange={this.handleNameChange} placeholder="Name" defaultValue={this.props.user.name}/>
        </div>
        <div className="item-target-url section-block">
          <h4>Target URL</h4>
          <input type="text" onChange={this.handleTargetURLChange} placeholder="Target URL pattern" defaultValue={this.props.user.targetURL}/>
        </div>

        <div className="item-attrs section-block">
          <h4>Attributes</h4>
          <div className="section-block">
          <AceEditor
            mode="json"
            value={this.state.attrs}
            tabSize={2}
            theme="clouds"
            width="300px"
            height="150px"
            onChange={this.handleAttrsChange.bind(this)}
            name={`editor_${this.props.user.name}`}
            setOptions={{showInvisibles: true}}
          />
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

  handleSave(){
    const item = {
      name : this.state.name,
      targetURL : this.state.targetURL,
      attrs : this.state.attrs
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
      && this.state.attrs && this.state.attrs.length > 0
    );
  } 


  handleNameChange=this.handleInputChange.bind(this, "name")
  handleTargetURLChange=this.handleInputChange.bind(this, "targetURL");
  handleInputChange(name:string, evt:any){
    let nextState:any = {};
    nextState[name] = evt.target.value;
    this.setState(nextState);
  }

  handleAttrsChange=this._handleAttrsChange.bind(this);
  _handleAttrsChange(attrs:string){
    console.log(attrs);
    this.setState({
      attrs : attrs
    });
  }

  openFileBrowser(){
    $(this.refs.file).click();
  }

  handleFileSelect(evt:any){
    const file = evt.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(this:EditItem,evt:any){
      //this.handleScriptChange(evt.target.result);
    }.bind(this);
    reader.readAsText(file);
  }
}


interface AttrsProps extends AttrsState{
  onChange : (value:any[]) => any;
}
interface AttrsState{
  value : any[];
}

class Attrs extends Component<AttrsProps, AttrsState>{
  constructor(props:AttrsProps){
    super(props);
    let initialState = Object.assign({}, this.initialState);
    this.state = Object.assign(initialState, props);
  }

  get initialState():AttrsState{
    return { value : [] }
  }

  render(){
    const attrs:any[] = this.renderAttrs();
    return <div className="attrs">
      {attrs}
      <button className="button" onClick={this.addAttr.bind(this)}>属性を追加</button>
    </div>;
  }

  renderAttrs(){
    return this.state.value.map((attr:any, index:number) => {
      if(!attr) return;
      return <Attr key={`attr-${attr.__id}`} {...attr}
        onChange={this.updateAttr.bind(this, index)}
        onRemove={this.removeAttr.bind(this, index)}/>;
    }).filter((item?:JSX.Element) => !!item);
  }

  addAttr(){
    //TODO: set uuid when adding item
    const newAttr = {
      _lid : uuid.v4(), //local id
      name : "",
      type : "",
      value : ""
    };
    this.state.value.push(newAttr);
    this.setState({ value : this.state.value }, () => {
      this.props.onChange(this.state.value);
    });
  }

  removeAttr(index:number){
    delete this.state.value[index];
    this.setState({ value : this.state.value }, () => {
      this.props.onChange(this.state.value);
    });
  }

  updateAttr(index:number, value:any){
    this.state.value[index] = value;
    this.setState({ value : this.state.value }, () => {
      this.props.onChange(this.state.value);
    });
  }
}

interface AttrProps extends AttrState{
  onChange : (value:any) => any;
}

interface AttrState{
  name : string;
  type : string;
  value : any;
}

class Attr extends Component<any, AttrState>{
  constructor(props:any){
    super(props);
    let initialState = Object.assign({}, this.initialState);
    this.state = Object.assign(initialState, {
      name : props.name,
      type : props.type,
      value : props.value
    });
  }

  get initialState():AttrState{
    return {
      name : "",
      type : "",
      value : "",
    };
  }

  render(){
    return <div className="attr-item">
      <div className="show-item">
        <div className="item-name">
          <input placeholder="属性名" value={this.state.name} onChange={this.handleChangeName}/>
        </div>
        <div className="item-type">
          <select value={this.state.type} onChange={this.handleChangeType}>
            <option value="">タイプ</option>
            <option value="number">数値</option>
            <option value="string">文字列</option>
            <option value="date">日付</option>
            <option value="nested">ネスト</option>
          </select>
        </div>
        <div className="item-value">
          {this.renderValue()}
        </div>
        <div className="item-remove">
          <Icons.Remove color="#757575" hoverColor="#C62828" cursor="pointer" width="16" height="16" onClick={this.props.onRemove}/>
        </div>
      </div>
      <div className="nested-item">
        {this.renderAttrs()}
      </div>
    </div>
  }

  renderValue(){
    if(this.state.type === "string"){
      return <input type="text" placeholder="文字を入力" value={this.state.value} onChange={this.handleChangeValue}/>
    }else if(this.state.type === "number"){
      return <input type="number" placeholder="数値を入力" value={this.state.value} onChange={this.handleChangeValue}/>
    }else if(this.state.type === "date"){
      return <input type="date" placeholder="日付を入力" value={this.state.value} onChange={this.handleChangeValue}/>
    }else if(this.state.type === "nested"){
      return ""; 
    }else{
      return <input placeholder="タイプを選択" disabled/>
    }
  }

  renderAttrs(){
    if(this.state.type === "nested"){
      return <Attrs value={this.state.value} onChange={this.handleChangeAttrs}/>
    }else{
      return "";
    }
  }

  handleChangeAttrs=this._handleChangeAttrs.bind(this);
  _handleChangeAttrs(value:any){
    this.setState({
      value : value
    }, this.afterChange);
  }

  handleChangeType=this._handleChangeType.bind(this);
  _handleChangeType(evt:any){
    const nextType = evt.target.value;
    const nextValue = nextType === "nested" ? [] : "";
    this.setState({
      type : nextType,
      value : nextValue
    }, this.afterChange);
  }
  
  handleChangeName=this._handleChangeInput.bind(this, "name");
  handleChangeValue=this._handleChangeInput.bind(this, "value");
  _handleChangeInput(name:string, evt:any){
    let nextState:any = {};
    nextState[name] = evt.target.value;
    this.setState(nextState, this.afterChange);
  }

  afterChange=this._afterChange.bind(this);
  _afterChange(){
    this.props.onChange({
      name : this.state.name,
      type : this.state.type,
      value : this.state.value
    });
  }
}