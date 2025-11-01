import { createContext, useState, useEffect } from "react";

// Create context
export const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({ role: "player" }); // Default role is "player"

    // Load user from localStorage or backend (e.g. after refresh)
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    // Save whenever user changes
    useEffect(() => {
        if (user) localStorage.setItem("user", JSON.stringify(user));
        else localStorage.removeItem("user");
    }, [user]);

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
    <UserContext.Provider value={{ user, setUser, logout }}>
        {children}
    </UserContext.Provider>
  );
};