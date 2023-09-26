import React from 'react';
import { Link } from 'react-router-dom';
import '../less/home.less';

export default function Home() {
  return (
    <>
      <Link to="/" className="link">Home</Link>
      <Link to="/layout" className="link">Layout</Link>
      <Link to="/form" className="link">Form</Link>
      <Link to="/wizards" className="link">Wizards</Link>
      <Link to="/table" className="link">Table</Link>
      <Link to="/tree" className="link">Tree</Link>
      <Link to="/panel" className="link">Panel</Link>
      <br />
    </>
  );
}
