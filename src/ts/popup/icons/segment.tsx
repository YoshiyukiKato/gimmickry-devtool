import React,{Component} from "react";
import {Icon,IconProps,IconState} from "./_icon";

export default class Approach extends Component<IconProps,any>{
  constructor(props:IconProps){
    super(props);
  }
  render(){
    return <Icon {...this.props}>
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
    </Icon>
  }
}