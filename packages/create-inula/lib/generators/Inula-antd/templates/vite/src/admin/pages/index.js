import Inula from 'inulajs';
import { Redirect } from 'inula-router';

function Index() {
  return <Redirect to={'/dashboard'} />;
}

export default Index;
