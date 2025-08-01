declare module "@woocommerce/woocommerce-rest-api" {
    import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"
  
    interface WooCommerceRestApiOptions {
      url: string
      consumerKey: string
      consumerSecret: string
      version?: string
      axiosConfig?: AxiosRequestConfig
      queryStringAuth?: boolean
      port?: number
      encoding?: string
      timeout?: number
    }
  
    export default class WooCommerceRestApi {
      constructor(options: WooCommerceRestApiOptions)
  
      get(endpoint: string, params?: object): Promise<AxiosResponse>
      post(endpoint: string, data: object, params?: object): Promise<AxiosResponse>
      put(endpoint: string, data: object, params?: object): Promise<AxiosResponse>
      delete(endpoint: string, params?: object): Promise<AxiosResponse>
      axios: AxiosInstance
    }
  }
  