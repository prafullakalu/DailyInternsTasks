import axios from "axios"

const API_URL = "http://localhost:5000/tracking"

const getTracking = async (token) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

const addTracking = async (data, token) => {
  const response = await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

const updateTracking = async (id, data, token) => {
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

const deleteTracking = async (id, token) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const trackingService = {
  getTracking,
  addTracking,
  updateTracking,
  deleteTracking,
}