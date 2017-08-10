import React,{Component} from "react";
import {Icon,IconProps,IconState} from "./_icon";

export default class Approach extends Component<IconProps,any>{
  constructor(props:IconProps){
    super(props);
  }
  render(){
    return <Icon {...this.props}>
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
      <path d="M0 0h24v24H0z" fill="none"/>
    </Icon>
  }
}