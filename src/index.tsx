import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import based from '@based/client'
import useLocalStorage from '@based/use-local-storage'
// @ts-ignore
import basedConfig from '../based.json'

const client = based(basedConfig)

let rootEl = document.getElementById('root')

if (!rootEl) {
  rootEl = document.createElement('div')
  rootEl.id = 'root'
  document.body.appendChild(rootEl)
}

const App = () => {
  const [email, setEmail] = useState<string>()
  const [password, setPassword] = useState<string>()

  // Stores the token and refreshToken in local storage
  const [token, setToken] = useLocalStorage('token')
  const [refreshToken, setRefreshToken] = useLocalStorage('refreshToken')

  const [data, setData] = useState<string>()

  const renewHandler = ({ token: newToken }: { token: string }) => {
    setToken(newToken)
  }

  useEffect(() => {
    client.on('renewToken', renewHandler)
    return () => {
      client.removeListener('renewToken', renewHandler)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      if (token) {
        // Authenticates the user with the stored token and supplies the refreshToken
        await client.auth(token, { refreshToken })
      } else {
        return client.auth(false)
      }
    })()

    // Calls a data function
    client
      .call('getSomeData')
      .then((result) => {
        setData(result)
      })
      .catch((_err) => {
        setData('No access')
      })
  }, [token])

  return (
    <div
      style={{
        width: 300,
        textAlign: 'left',
        margin: 'auto',
        paddingTop: 40,
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <p style={{ marginBottom: 16 }}>
        <strong>Data: </strong>
        {data}
      </p>
      {token ? (
        <button
          style={{
            backgroundColor: 'lightgray',
            padding: 8,
            cursor: 'pointer',
          }}
          onClick={async () => {
            await client.logout()
            setToken(null)
            setRefreshToken(null)
          }}
        >
          Logout
        </button>
      ) : (
        <>
          <input
            style={{ border: '1px solid black', marginBottom: 16 }}
            placeholder="email"
            name="email"
            onChange={(e) => {
              setEmail(e.target.value)
            }}
          />
          <input
            style={{ border: '1px solid black', marginBottom: 16 }}
            placeholder="password"
            type="password"
            name="password"
            onChange={(e) => {
              setPassword(e.target.value)
            }}
          />
          <button
            style={{
              backgroundColor: 'lightgray',
              padding: 8,
              cursor: 'pointer',
            }}
            onClick={async () => {
              const { token, refreshToken } = await client.login({
                email,
                password,
              })
              setToken(token)
              setRefreshToken(refreshToken)
            }}
          >
            Login
          </button>
        </>
      )}
    </div>
  )
}

render(<App />, rootEl)
