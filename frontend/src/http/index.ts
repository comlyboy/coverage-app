import axios, { AxiosError, AxiosRequestConfig, Method } from "axios";
import { IBaseApiResponse } from "../types";


/** Http for all methods. Bypasses axios http interceptor by choice */
export async function sendHttpRequest<TResponse extends Record<string, any>, TBody extends Record<string, any> = any>(
	options: Omit<AxiosRequestConfig<TBody>, 'baseURL'> & {
		/**
		 * Set `true` to use defined axios interceptor
		 * @default `true`;
		 *
		 * setting to false is important
		 */
		useCustomInterception?: boolean;
	}
) {
	options.useCustomInterception = options.useCustomInterception === false ? options.useCustomInterception : true;
	const response = options.useCustomInterception ? await getHttpClient()(options) : await axios(options);
	return response.data as IBaseApiResponse<TResponse>;
}

function getHttpClient() {
	// cancel previous http request https://www.youtube.com/watch?v=cIwpavIhI84
	const httpClient = axios.create({ baseURL: process.env.API_URL });

	httpClient.interceptors.request.use(
		config => {
			const token = localStorage.getItem("token");
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		},
		error => {
			return Promise.reject({ error });
		}
	);

	httpClient.interceptors.response.use(
		response => { return response },
		(error: AxiosError<{ error: Record<string, any>; }>) => {
			let errorObject: Record<string, any>;
			const originalRequest = error.config as any;
			if (error.response && (error.response?.status > 399 && error.response?.status < 600)) {
				errorObject = error?.response?.data?.error;
			} else {
				const newError = (error as Record<string, any>).error || error as AxiosError;
				const errorResponse = newError?.response! as any;

				errorObject = {
					statusCode: newError?.response?.status || 500,
					message: newError?.response?.statusText! || errorResponse?.message || error.message,
					path: errorResponse?.path,
					method: errorResponse?.method as Method,
					// timestamp: errorResponse?.timestamp
				};
			};

			if (error.response?.status === 401 && !originalRequest._retry) {
				originalRequest._retry = true;
			}
			return Promise.reject(errorObject);
		}
	);
	return httpClient;
}