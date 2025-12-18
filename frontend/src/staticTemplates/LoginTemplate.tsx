
import html from '../../templates/login.html?raw';

export default function LoginTemplate(): JSX.Element {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
