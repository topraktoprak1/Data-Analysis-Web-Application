
import html from '../../templates/forgot-password.html?raw';

export default function ForgotPasswordTemplate(): JSX.Element {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
