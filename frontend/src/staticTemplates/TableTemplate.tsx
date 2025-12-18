import html from '../../templates/table.html?raw';

export default function TableTemplate(): JSX.Element {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
