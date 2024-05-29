import React, { useEffect } from 'react'
import { useState } from 'react';
import './Chat.css';
import send from '../../images/send.png';
import {user} from '../Join/Join' 
import socketIo from 'socket.io-client';
import Message from '../Message/Message';
import ReactScrollToBottom from "react-scroll-to-bottom";
import closeicon from "../../images/closeicon.png";



const ENDPOINT = "http://localhost:8000/";
let socket;

const Chat = () => {
  const [id, setid] = useState("");
  const [messages, setMessages] = useState([])
  

  const sent = () => {
      const message = document.getElementById('inputchat').value;
      socket.emit('message', { message, id });
      document.getElementById('inputchat').value = "";
  }

  console.log(messages);


  useEffect(() => {
      socket = socketIo(ENDPOINT, { transports: ['websocket'] });

      socket.on('connect', () => {
          console.log('Connected');
          setid(socket.id);

      })
      console.log(socket);
      socket.emit('joined', { user })

      socket.on('welcome', (data) => {
            setMessages([...messages, data]);
            console.log(data.user, data.message);
      })

      socket.on('userjoined', (data) => {
            setMessages([...messages, data]);
            console.log(data.user, data.message);
      })

      socket.on('leave', (data) => {
            setMessages([...messages, data]);
            console.log(data.user, data.message)
      })

      return () => {
          socket.emit('disconect');
          socket.off();
      }
  }, [])

  useEffect(() => {
      socket.on('sendMessage', (data) => {
            setMessages([...messages, data]);
            console.log(data.user, data.message, data.id);
      })
      return () => {
            socket.off();
      }
  }, [messages])

  return (
    <div className="chatpage">
      <div className="chatcontain">
        <div className="header">
            <h2>AdiGram</h2>
            <a href="/"> <img src={closeicon} alt="Close" /></a>
        </div>
        <ReactScrollToBottom className="chatbox">
            {messages.map((item, i) => <Message user={item.id === id ? '' : item.user} message={item.message} classs={item.id === id ? 'right' : 'left'} />)}
        </ReactScrollToBottom>
        <div className="inputbox">
            <input onKeyPress={(event) => event.key === 'Enter' ? sent() : null} type="text" id="inputchat" placeholder="Enter Message here" />
            <button onClick={sent} id="sendbtn"><img src={send} alt="send" id="sendimg" /></button>
        </div>
      </div>

    </div>
  )
}


export default Chat;
