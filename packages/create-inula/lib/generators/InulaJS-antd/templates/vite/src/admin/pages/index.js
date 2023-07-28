import React from 'react';
import { Redirect } from 'react-router-dom';

function Index() {
  return <Redirect to={`/dashboard`} />;
}

export default Index;
