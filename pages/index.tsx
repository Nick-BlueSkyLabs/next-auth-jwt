import { useState, useEffect } from "react"
import type { NextPage } from 'next'
import { firebaseConfig } from '../Firebase/config'
import { initializeApp } from 'firebase/app'
import type { User } from 'firebase/auth'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import Axios from 'axios'

const firebaseApp = initializeApp(firebaseConfig)
const firebaseAuth = getAuth(firebaseApp)
const googleProvider = new GoogleAuthProvider()
const axios = Axios.create({
  baseURL: "https://echo-api-gateway-1yrvv7cx.ts.gateway.dev/api/"
})

const Home: NextPage = () => {

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [result, setResult] = useState<any>({})
  const [text, setText] = useState<string>("")

  console.log({user})

  useEffect(() => {
    firebaseAuth.onAuthStateChanged((user) => { setUser(user); setLoading(false) })
  }, [])

  useEffect(() => {
    (async () => {
      if (user) {
        const token = await user.getIdToken()
        axios.defaults.headers = {
          Authorization: `Bearer ${token}`
        }
        console.log({ token })
      }
    })()
  }, [user])

  const handleSignIn = async () => {
    await signInWithPopup(firebaseAuth, googleProvider)
  }

  const handleSignOut = async () => {
    await firebaseAuth.signOut()
  }

  const handleForm = (fn: any) => {
    return async (e: any) => {
      e.preventDefault()
      await fn();
    }
  }

  const callEcho = async () => {
    const { data } = await axios.get("/", { params: { echo: text }})
    setResult(data)
  }

  return (
    <>
      <header>
        <h1>nextjs firebase jwt</h1>
      </header>
      <main>
        <div>
          <form onSubmit={handleForm(callEcho)}>
            <input onChange={e => setText(e.target.value)} value={text} />
            <button type="submit">Submit</button>
          </form>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
        <div>
          <button onClick={handleSignIn}>Sign in with google</button>
          <button onClick={handleSignOut}>Sign out</button>
          {loading ? <pre>loading</pre> : <pre>{JSON.stringify(user, null, 2)}</pre>}
        </div>
      </main>
    </>
  )
}

export default Home
