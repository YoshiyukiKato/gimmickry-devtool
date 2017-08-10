import React,{Component} from "react";
import {Icon,IconProps,IconState} from "./_icon";

export default class Approach extends Component<IconProps,any>{
  constructor(props:IconProps){
    super(props);
  }
  render(){
    return <Icon {...this.props}>
      <circle cx="7.2" cy="14.4" r="3.2"/>
      <circle cx="14.8" cy="18" r="2"/>
      <circle cx="15.2" cy="8.8" r="4.8"/>
    </Icon>
  }
}