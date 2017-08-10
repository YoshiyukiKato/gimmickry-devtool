import React,{Component} from "react";
import {Icon,IconProps,IconState} from "./_icon";

export default class Success extends Component<IconProps,any>{
  constructor(props:IconProps){
    super(props);
  }
  render(){
    return <Icon {...this.props}>
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
    </Icon>
  }
}