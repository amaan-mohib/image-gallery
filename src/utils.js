import axios from "axios";

export const customAxios = axios.create({
  baseURL: "https://api.unsplash.com/",
  headers: {
    Authorization: `Client-ID lDAaFYJhY1w4owP1XfaOOiSNs9LKso3nM3GO_CR1xic`,
  },
});
