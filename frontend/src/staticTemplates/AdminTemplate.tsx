import adminHtml from '../../templates/admin.html?raw';

export default function AdminTemplate(): JSX.Element {
  return <div dangerouslySetInnerHTML={{ __html: adminHtml }} />;
}
