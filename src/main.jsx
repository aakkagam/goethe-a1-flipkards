import { render } from 'preact';
import '@fontsource-variable/literata';
import '@fontsource-variable/atkinson-hyperlegible-next';
import './style.css';
import { App } from './app.jsx';

render(<App />, document.getElementById('app'));
