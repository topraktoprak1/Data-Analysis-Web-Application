
import html from '../../templates/graphs.html?raw';

export default function GraphsTemplate(): JSX.Element {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
