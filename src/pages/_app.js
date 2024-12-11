import App from '../App';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <App>
      <Component {...pageProps} />
    </App>
  );
}
