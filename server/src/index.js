import dotenv from 'dotenv'
import { config } from './config.js'
import { createApp } from './app.js'

dotenv.config()

const PORT = config.port
const app = await createApp()
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`)
})


