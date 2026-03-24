import '../styles/globals.css'
import Head from 'next/head'
import { AuthProvider } from '../lib/auth'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>Carwise — Know before you buy</title>
        <meta name="description" content="Stop getting ripped off buying a used car. Get an instant shortlist of the best cars available to you right now, and an honest verdict on any car you're considering." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
