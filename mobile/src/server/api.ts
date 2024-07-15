import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://192.168.162.167:3333'
})
