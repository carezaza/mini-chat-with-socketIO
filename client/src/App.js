import React from "react";
import MessageBox from "./message-box";
import io from "socket.io-client";
import "./message-box.css";

const socket = io("https://chat-with-react-socket-care.herokuapp.com/");

const App = () => {
  const [name, setName] = React.useState("");
  const [user, setUser] = React.useState(null);
  const [users, setUsers] = React.useState(null);
  const [suc, setSuc] = React.useState(null);
  const [pending, setPending] = React.useState(false);

  const handleClick = () => {
    if (!name.trim()) {
      return;
    }
    setPending(true);
    socket.emit("request-join", name);
    setName("");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      handleClick();
      // if (!name.trim()) {
      //   return;
      // }
      // socket.emit("request-join", name);
      // setName("");
    }
  };

  // React.useEffect(() => {
  //   if (window.performance) {
  //     if (performance.navigation.type == 1) {
  //       if (user) {
  //         socket.emit("delete-user", user);
  //       }
  //     }
  //   }
  // }, []);

  React.useEffect(() => {
    socket.on("response-join", ({ success, your_user }) => {
      setSuc(success);
      if (success === true) {
        setUser(your_user);
      }
      setPending(false);
    });
    socket.on("get-users", (us) => {
      setUsers(us);
    });

    return () => {};
  }, []);

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {pending ? (
        <div style={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
          Loading...
        </div>
      ) : user ? (
        <div className="container">
          <div className="userBox">
            <ul>
              {users.map((u) => (
                <li key={u.id}>{u.name}</li>
              ))}
            </ul>
          </div>{" "}
          <MessageBox socket={socket} user={user} />
        </div>
      ) : (
        <div>
          <p style={{ color: "#fff" }}>Enter your name</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ height: 40, padding: 5, borderRadius: 3, fontWeight: 600 }}
          />
          {suc === false && (
            <p style={{ color: "red", padding: 0, margin: "auto" }}>
              The name is already taken!
            </p>
          )}
          <button onClick={handleClick} className="btn">
            JOIN
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
