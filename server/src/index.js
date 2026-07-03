import dotenv from 'dotenv'
import { config } from './config.js'
import { createApp } from './app.js'

dotenv.config()

const PORT = config.port
const app = await createApp()
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})


