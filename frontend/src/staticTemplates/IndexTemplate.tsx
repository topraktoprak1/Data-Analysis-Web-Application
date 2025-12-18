
import html from '../../templates/index.html?raw';

export default function IndexTemplate(): JSX.Element {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
