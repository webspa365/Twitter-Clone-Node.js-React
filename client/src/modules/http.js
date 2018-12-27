import axios from 'axios'
import {config} from '../modules/config'

export const http = axios.create({
  baseURL: config.server,
  timeout: 10000
});
