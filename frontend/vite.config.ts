import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(configuration => {
	const env = loadEnv(configuration.mode, process.cwd(), '');
	return {
		define: {
			'process.env': env
		},
		plugins: [react()],
	}
})
