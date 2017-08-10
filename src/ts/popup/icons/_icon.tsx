import React from "react"

export interface IconProps{
  color? : string;
  hoverColor? : string | null;
  cursor? : string;
  width? : string;
  height? : string;
  viewBox? : string;
  className? : string;
  id? : string;
  onClick? : (evt:any) => any;
}

export interface IconState{
  isHover : boolean;
  color : string;
  hoverColor : string | null;
  width : string;
  cursor : string;
  height : string;
  viewBox : string;
}

export class Icon extends React.Component<IconProps, IconState>{
  constructor(props:IconProps){
    super(props);
    this.state = Object.assign(this.initialState, props);
  }

  get initialState():IconState{
    return {
      isHover : false,
      color : "#000000",
      hoverColor : null,
      cursor : "default",
      width : "12",
      height : "12",
      viewBox : "0 0 24 24",
    };
  }
  
  render(){
    return <svg id={this.props.id}
      className={this.props.className}
      style={this.getStyle()}
      width={this.state.width}
      height={this.state.height}
      viewBox={this.state.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      onClick={this.props.onClick}
      onMouseOver={this.handleMouseOver.bind(this)}
      onMouseOut={this.handleMouseOut.bind(this)}>
      {this.props.children}
    </svg>;
  }

  getStyle(){
    const color = this.props.color ? this.props.color : this.state.color;
    const hoverColor = this.props.hoverColor ? this.props.hoverColor : this.state.hoverColor;
    return {
      fill : this.state.isHover ? (hoverColor || color) : color,
      cursor : this.state.cursor,
      transition : "all 0.2s",
      verticalAlign : "middle"
    };
  }

  handleMouseOver(){
    this.setState({ isHover : true })
  }
  handleMouseOut(){
    this.setState({ isHover : false })
  }
}