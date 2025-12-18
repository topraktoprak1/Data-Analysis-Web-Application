
import html from '../../templates/profile.html?raw';

export default function ProfileTemplate(): JSX.Element {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
