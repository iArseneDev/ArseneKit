import JsonFormatter from './json-formatter';

export const metadata = {
  title: 'JSON Formatter & Validator — Format and Minify JSON',
  description:
    'Format, minify, sort, and validate JSON online. Find syntax errors with line and column details. Your data stays in your browser.',
};

export default function JsonFormatterPage() {
  return <JsonFormatter />;
}
