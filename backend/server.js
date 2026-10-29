
import express from "express";
import axios from "axios";
import "dotenv/config";

const app = express();

app.use(express.json());
app.listen(5000, () => {
    console.log("TrackGPT backend running at http://localhost:5000");
});

app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
            {
                email,
                password,
                returnSecureToken: true
            }
        );

        res.json({
            message: "Login successful",
            uid: response.data.localId,
            email: response.data.email,
            idToken: response.data.idToken,
            refreshToken: response.data.refreshToken,
            expiresIn: response.data.expiresIn
        });

    } catch (error) {
        if (error.response) {
            return res.status(401).json({
                message: "Login failed. Check your email and password."
            });
        }

        console.error("Authentication service error:", error.message);

        return res.status(500).json({
            message: "Authentication service unavailable"
        });
    }
});



app.post("/auth/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }
        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`,
            {
                email,
                password,
                returnSecureToken: true
            }
        );
        const { idToken, refreshToken, localId } = response.data;
        await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${process.env.FIREBASE_API_KEY}`,
            {
                idToken,
                displayName: name.trim(),
                returnSecureToken: true
            }
        );
        res.status(201).json({
            message: "Signup successful",
            uid: localId,
            name: name.trim(),
            email: response.data.email,
            idToken,
            refreshToken,
            expiresIn: response.data.expiresIn
        });
    } catch (error) {
        if (error.response) {
            const firebaseError =
                error.response.data?.error?.message;
            if (firebaseError === "EMAIL_EXISTS") {
                return res.status(409).json({
                    message: "Email is already registered"
                });
            }
            if (firebaseError === "INVALID_EMAIL") {
                return res.status(400).json({
                    message: "Invalid email address"
                });
            }
            return res.status(400).json({
                message: "Signup failed",
                error: firebaseError
            });
        }
        console.error("Signup error:", error.message);
        return res.status(500).json({
            message: "Authentication service unavailable"
        });
    }
});
