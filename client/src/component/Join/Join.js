import React from 'react'
import "./Join.css";
import logo from "../../images/logo.png";
import {Link} from 'react-router-dom';
import { useState } from 'react';


let user;
const senduser = () =>{
  user = document.getElementById('joininput').value;
  document.getElementById('joininput').value = "";
}


const Join = () => {

  const [name, setname] = useState("")
  return (
    <div className='Joinpage'>
      <div className="JoinContainer">
        <img src={logo} alt=" "/>
        <h1>ADI GRAM</h1>
        <input onChange={(e)=> setname(e.target.value)} type="text" placeholder="Enter Name" id="joininput"/>
        <Link onClick={(e)=> !name ? e.preventDefault():null } to="/chat"><button onClick={senduser} className="joinbtn">Login</button></Link>
      </div>
        
    </div>
  )
}

export default Join;
export {user};