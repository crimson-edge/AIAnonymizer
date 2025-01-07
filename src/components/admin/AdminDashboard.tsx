'use client';

import { useState } from 'react';
import APIKeyManagement from './APIKeyManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('api-keys');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <APIKeyManagement />
        </TabsContent>

        <TabsContent value="users">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p>Coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Admin Settings</h2>
            <p>Coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
