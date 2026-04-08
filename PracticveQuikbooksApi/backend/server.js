import express from "express"
import axios from "axios"
import dotenv from "dotenv"
import cors from "cors"
import jwt from "jsonwebtoken"

dotenv.config()

const app = express()
app.use(cors())

const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const redirectUri = "http://localhost:5000/callback"
const port = process.env.PORT || 5000

// Step 1: Redirect to QuickBooks Login
app.get("/auth", (req, res) => {
  const authUrl = new URL("https://appcenter.intuit.com/connect/oauth2")

  authUrl.searchParams.append("client_id", clientId)
  authUrl.searchParams.append("response_type", "code")
  authUrl.searchParams.append("scope", "com.intuit.quickbooks.accounting")
  authUrl.searchParams.append("redirect_uri", redirectUri)
  authUrl.searchParams.append("state", "testState123")

  res.redirect(authUrl.toString())
})

// Step 2: Callback - Exchange Code for Tokens
app.get("/callback", async (req, res) => {
  const { code, realmId } = req.query

  if (!code) {
    return res.status(400).json({ error: "Authorization code missing" })
  }

  try {
    const tokenResponse = await axios.post(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
      }
    )

    const tokenData = tokenResponse.data

    const decodedIdToken = jwt.decode(tokenData.id_token)

    res.json({
      success: true,
      realmId,
      tokenType: tokenData.token_type,
      accessToken: tokenData.access_token,
      accessTokenExpiresIn: tokenData.expires_in,
      refreshToken: tokenData.refresh_token,
      refreshTokenExpiresIn: tokenData.x_refresh_token_expires_in,
      idToken: tokenData.id_token,
      decodedIdToken
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Token exchange failed",
      error: error.response?.data || error.message
    })
  }
})

// Step 3: Refresh Token Endpoint
app.get("/refresh", async (req, res) => {
  const { refreshToken } = req.query

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token missing" })
  }

  try {
    const response = await axios.post(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
      }
    )

    res.json({
      success: true,
      ...response.data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    })
  }
})

app.get("/company-info", async (req, res) => {
  const { accessToken, realmId } = req.query

  if (!accessToken || !realmId) {
    return res.status(400).json({ error: "Missing accessToken or realmId" })
  }

  try {
    const response = await axios.get(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    )

    res.json({
      success: true,
      companyInfo: response.data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    })
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})