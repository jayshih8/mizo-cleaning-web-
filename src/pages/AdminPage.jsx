import React from 'react';
import AdminEditor from './AdminEditor';
import originalConfig from '../data/contentConfig.json';

export default function AdminPage({ draft, ...props }) {
  return <AdminEditor configData={draft || originalConfig} {...props} />;
}
