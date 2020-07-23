import React from "react";
import "./message-box.css";

const MessageBox = ({ socket, user }) => {
  const [msg, setMsg] = React.useState({
    text: "",
    who: user,
  });

  const [messages, setMessages] = React.useState([]);
  const [typing, setTyping] = React.useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMsg((s) => ({ ...s, [name]: value }));
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (!msg.text.trim()) {
        return;
      }
      socket.emit("send-message", msg);
      setMsg((s) => ({ ...s, text: "" }));
    }
  };

  React.useEffect(() => {
    if (msg.text) {
      socket.emit("typing", { who: user.id });
    } else {
      socket.emit("typing", { who: "" });
    }
  }, [msg.text, user.id, socket]);

  React.useEffect(() => {
    socket.on("typing-res", (res) => {
      setTyping(res.user);
    });
    socket.on("message-res", (res) => {
      setMessages((s) => [...s, res]);
    });
    socket.on("join-message", ({ text, who }) => {
      if (who.id !== user.id) setMessages((s) => [...s, { text, who }]);
    });
    socket.on("disconnect-message", ({ text, who }) => {
      if (who.id !== user.id) setMessages((s) => [...s, { text, who }]);
    });
  }, [socket, user, user.id]);

  return (
    <div className="box">
      <div className="topBar">{`Hello, ${user.name}`}</div>
      <div className="msg-box">
        <div className="list">
          {/* { show messages } */}
          {messages.map((m, i) => (
            <div style={{ display: "flex" }} key={i}>
              {m.who.id === user.id ? (
                <div className="right-msg">
                  <div className="me">{m.who.name}</div>
                  <div className="text">{m.text}</div>
                </div>
              ) : (
                <div className="left-msg">
                  <div className="text">{m.text}</div>
                  <div className="me">{m.who.name}</div>
                </div>
              )}
            </div>
          ))}

          {/* { Typing } */}
          {typing && typing !== user.id && (
            <div style={{ display: "flex" }}>
              <div className="typing">typing...</div>
            </div>
          )}
        </div>
      </div>
      <div className="input-box">
        <input
          type="text"
          name="text"
          value={msg.text}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default MessageBox;
