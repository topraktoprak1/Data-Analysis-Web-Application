
import html from '../../templates/register.html?raw';

export default function RegisterTemplate(): JSX.Element {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
