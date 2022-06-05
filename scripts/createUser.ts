import fs from 'fs'
import based from '@based/client'

// Loads the based config file that sets up your based connection
const basedConfig = JSON.parse(fs.readFileSync('../based.json', 'utf8'))

// Loads apiKey so we can have based access from a script
// Note: apiKeys should only be used for util scripts or server/server connections
const apiKey = fs.readFileSync('../apiKey.key', 'utf8')

;(async () => {
  // Create a based client
  const client = based(basedConfig)

  // Autheicate client with an apiKey
  await client.auth(apiKey, { isApiKey: true })

  // Add our user
  const { id } = await client.set({
    type: 'user',
    name: 'Demo User',
    email: 'demo@wawa.com',
    password: 'superStrongPassword',
  })
  console.log('Added user ' + id)

  process.exit()
})()
