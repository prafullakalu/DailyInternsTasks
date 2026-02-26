// simple helpers in case direct access is needed outside redux
const TOKEN_KEY = "rbac_token"

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY)
}

export const saveToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY)
}
