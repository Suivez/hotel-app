import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (token) {
      setLoggedIn(true);
      setRole(userRole);
      loadRooms();
    }
  }, []);

  async function loadRooms() {
    const response = await fetch("http://localhost:3000/rooms");
    const data = await response.json();
    setRooms(data);
  }

  async function handleLogin() {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      setRole(data.role);

      setLoggedIn(true);

      loadRooms();
    } else {
      alert("Invalid username or password");
    }
  }

  if (!loggedIn) {
    return (
      <div>
        <h1>Logowanie</h1>

        <input
          placeholder="Login"
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button onClick={handleLogin}>
          Login
        </button>
      </div>
    );
  }

  async function changeStatus(id, currentStatus) {
    const token = localStorage.getItem("token");

    const newStatus =
      currentStatus === "empty"
        ? "occupied"
        : "empty";

    await fetch(`http://localhost:3000/rooms/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status: newStatus
      })
    });

    loadRooms();
  }

  function getStatusStyleBorder(status) {
    switch (status) {
      case "empty":
        return "2px solid #155724";

      case "occupied":
        return "2px solid #721c24";

      default:
        return "2px solid #ccc";
    }
  }
    

  function getStatusStyle(status) {
    switch (status) {
      case "empty":
        return {
          backgroundColor: "#d4edda",
          color: "#155724",
        };

      case "occupied":
        return {
          backgroundColor: "#f8d7da",
          color: "#721c24",
        };

      default:
        return {};
    }
  }

      function logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      setLoggedIn(false);
      setRole("");
      setRooms([]);
    }

  return (
    <div>
      <button
        onClick={logout}
        style={{
          backgroundColor: "#4a4c4d",
          marginBottom: "20px",
          padding: "8px 16px",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
      <h1>Hotel Rooms</h1>
      <input
        type="text"
        placeholder="🔍 Search for the room..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          borderRadius: "8px",
          border: "1px solid #ccc"
        }}
      />

      <br />
      <br />

      {rooms
        .filter((room) =>
          room.number
            .toString()
            .includes(search) ||
          room.status
            .toLowerCase()
            .includes(search.toLowerCase())
        )
        .map((room) => (
          <div
            key={room.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
              padding: "10px",
              border: getStatusStyleBorder(room.status),
              borderRadius: "8px",
            }}
          >
            <strong>Room {room.number}</strong>

            <span
              style={{
                ...getStatusStyle(room.status),
                padding: "4px 10px",
                borderRadius: "20px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              {room.status}
            </span>

            {role === "owner" && (
              <button className="status-button"
                onClick={() =>
                  changeStatus(room.id, room.status)
                }
              >
                Change Status
              </button>
            )}
          </div>
        ))}
    </div>
  );
}

export default App;