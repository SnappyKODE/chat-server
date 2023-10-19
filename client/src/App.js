import './App.css';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function App() {
  let [socket, setSocket] = useState(null);

  const [messagesRecieved, setMessagesRecieved] = useState([]);
  const [connectionMade, setConnectionMade] = useState(false);
  const [inputText, setInputText] = useState('');
  const [nonWebhookResult, setNonWebhookResult] = useState('');

  useEffect(() => {
    // Instantiate the socket connection on just initial render.
    let mySocket = io(process.env.REACT_APP_BACKEND_URL);

    // any socket.on(...) registers a handler with your app to take action when
    // the server sends the client a message.

    // This callback happens when the server sends the client a message with the
    // event name 'connectionSuccess'.
    mySocket.on('connectionSuccess', (arg) => {
      console.log('Connection Made!');
      setConnectionMade(true);
    });

    // This callback happens when the server sends the client a message with the
    // event name 'update'.
    mySocket.on('update', (arg) => {
      console.log('Data was sent to me: ' + arg);
      setMessagesRecieved((prevMessagesReceived) => [
        ...prevMessagesReceived,
        arg,
      ]);
    });

    setSocket(mySocket);
  }, []);

  const makeHttpCall = async () => {
    fetch(process.env.REACT_APP_BACKEND_URL + "/")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setNonWebhookResult(res.text);
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>socket.io demo on render.com</h1>
        <div
          style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap' }}
        >
          <p>Connected to server? {connectionMade ? '✅' : '🛑'}</p>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            paddingBottom: '50px',
          }}
        >
          <button onClick={() => makeHttpCall()}>Make non-webhook call</button>
          <p style={{paddingLeft: "10px"}}>{nonWebhookResult}</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // socket.emit(...) pushes a message to the server.
            // This one pushes an event with the name "sendData".
            socket.emit('sendData', inputText);
            setInputText('');
          }}
          style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap' }}
        >
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            type="text"
          />
          <button>Send to the server</button>
        </form>

        <p>Messages received:</p>
        <ul>
          {messagesRecieved.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
